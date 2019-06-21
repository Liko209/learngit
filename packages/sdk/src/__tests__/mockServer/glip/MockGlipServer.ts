import assert from 'assert';
import { LokiDB } from 'foundation';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { Post } from 'sdk/module/post/entity/Post';
import url from 'url';

import { Router } from '../Router';
import {
  IMockServer,
  INetworkRequestExecutorListener,
  IRequest,
} from '../types';
import { createResponse } from '../utils';
import { GlipClientConfigDao } from './dao/clientConfig';
import { GlipCompanyDao } from './dao/company';
import { GlipGroupDao } from './dao/group';
import { GlipGroupStateDao } from './dao/groupState';
import { GlipItemDao } from './dao/item';
import { GlipPersonDao } from './dao/person';
import { GlipPostDao } from './dao/post';
import { GlipProfileDao } from './dao/profile';
import { GlipStateDao } from './dao/state';
import * as data from './data/data';
import { schema } from './glipSchema';
import { ResponseAdapter } from './ResponseAdapter';
import {
  GlipData,
  Handler,
  IApi,
  InitialData,
  IResponseAdapter,
} from './types';

interface IGlipApi extends IApi {
  '/api/login': {
    put: Handler;
  };
  '/v1.0/desktop/initial': {
    get: Handler;
  };
  '/api/posts': {
    get: Handler;
  };
  '/api/posts_items_by_ids': {
    get: Handler;
  };
  '/api/post': {
    post: Handler;
  };
}

export class MockGlipServer implements IMockServer {
  private _router: Router;
  postDao: GlipPostDao;
  itemDao: GlipItemDao;
  groupDao: GlipGroupDao;
  stateDao: GlipStateDao;
  personDao: GlipPersonDao;
  profileDao: GlipProfileDao;
  clientConfigDao: GlipClientConfigDao;
  companyDao: GlipCompanyDao;
  groupStateDao: GlipGroupStateDao;
  db: LokiDB;

  api: IGlipApi = {
    '/api/login': { put: request => this.login(request) },
    '/api/posts': { get: async request => await this.getPosts(request) },
    '/api/posts_items_by_ids': {
      get: async request => await this.getPostsItemsByIds(request),
    },
    '/api/post': { post: async request => await this.createPost(request) },
    '/v1.0/desktop/initial': {
      get: async request => await this.getInitialData(request),
    },
  };

  constructor() {
    const adapter: IResponseAdapter = new ResponseAdapter();
    this._router = new Router((routePath, path) => {
      return routePath === path || routePath === '*';
    },                        adapter);
    this._router.applyApi(this.api);
    this._router.use('get', '*', this._handleCommon);
    this._router.use('put', '*', this._handleCommon);
    this._router.use('post', '*', this._handleCommon);
    this.init();
  }

  public init() {
    this.db = new LokiDB(schema);
    this.companyDao = new GlipCompanyDao(this.db);
    this.postDao = new GlipPostDao(this.db);
    this.itemDao = new GlipItemDao(this.db);
    this.groupDao = new GlipGroupDao(this.db);
    this.stateDao = new GlipStateDao(this.db);
    this.groupStateDao = new GlipGroupStateDao(this.db);
    this.personDao = new GlipPersonDao(this.db);
    this.profileDao = new GlipProfileDao(this.db);
    this.clientConfigDao = new GlipClientConfigDao(this.db);
  }

  public dispose() {
    this.db && this.db.delete();
  }

  applyGlipData = (glipData: GlipData) => {
    // const glipDataTemplate = parseInitialData(initialData);
    this.companyDao.bulkPut(glipData.company);
    this.profileDao.bulkPut(glipData.profile);
    this.stateDao.bulkPut(glipData.state);
    glipData.groupState && this.groupStateDao.bulkPut(glipData.groupState);
    // this.personDao.insert(glipDataTemplate.user);
    this.personDao.bulkPut(glipData.people);
    this.groupDao.bulkPut(glipData.groups);
    this.groupDao.bulkPut(glipData.teams);
    this.clientConfigDao.bulkPut(glipData.clientConfig);
  }

  login = (request: IRequest) => {
    return createResponse({
      status: 200,
      statusText: '[mock] login success',
    });
  }

  getInitialData = async (request: IRequest<any>) => {
    const user = this.personDao.findOne();
    const company = this.companyDao.findOne();
    // const profile = this.profileDao.findOne();
    const buildInitialData = {
      user_id: user!._id,
      company_id: company!._id,
      profile: this.profileDao.findOne()!,
      companies: [company],
      state: this.stateDao.findOne(),
      people: this.personDao.lokiCollection.find(),
      groups: await this.groupDao.getGroups(),
      teams: await this.groupDao.getTeams(),
      client_config: this.clientConfigDao.findOne(),
      static_http_server: 'https://d2rbro28ib85bu.cloudfront.net',
    };
    return createResponse({
      data: buildInitialData,
    });
  }

  initData = async () => {
    const initialData: InitialData = {} as any;
    // current account data
    // const account = {
    //   _id: initialData.user_id,
    //   company_id
    // }
    let profileId = 123;
    if (initialData.profile) {
      profileId = initialData.profile._id || profileId;
      this.profileDao.create({ ...initialData.profile, _id: profileId });
    }
  }

  getPosts = async (request: IRequest) => {
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByGroupId(group_id),
        items: await this.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  getPostsItemsByIds = async (request: IRequest) => {
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByGroupId(group_id),
        items: await this.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  createPost = async (request: IRequest<Post>) => {
    const updateResult = this.postDao.put(request.data as any);
    return createResponse({
      request,
      data: updateResult,
    });
  }

  handle = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    this._router.dispatch(request, cb);
  }

  _handleCommon = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    const mockJsonPath = this.getMockJsonPath(request.host, request.path);
    if (fs.existsSync(mockJsonPath)) {
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      cb.onSuccess({ request, ...result.response });
    } else {
      cb.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as any);
    }
  }

  getMockJsonPath = (host: string, uri: string) => {
    const { hostname } = url.parse(host);
    const relatePath = `${hostname}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../../../',
      `./testingData/http/${relatePath}/200.json`,
    );
    return mockDataPath;
  }

  getRouter = () => this._router;
}
