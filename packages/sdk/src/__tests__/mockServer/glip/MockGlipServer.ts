import { IResponse, LokiDB } from 'foundation';
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
import { GlipGroupDao } from './dao/group';
import { GlipItemDao } from './dao/item';
import { GlipPersonDao } from './dao/person';
import { GlipPostDao } from './dao/post';
import { GlipProfileDao } from './dao/profile';
import { GlipStateDao } from './dao/state';
import * as data from './data';
import { schema } from './glipSchema';
import { InitialData, IApi, Handler, IResponseAdapter } from './types';

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

function isPromise(p: any): p is Promise<any> {
  return p && p.then;
}

class AdapterImpl implements IResponseAdapter {
  adapt = (handler: Handler) => {
    return (request: IRequest, cb: INetworkRequestExecutorListener) => {
      let handlerResp;
      try {
        handlerResp = handler(request);
      } catch (error) {
        cb.onFailure(
          createResponse({
            request,
            data: { error },
            status: 500,
            statusText: 'Mock server internal error',
            headers: {},
          }),
        );
        return;
      }
      if (isPromise(handlerResp)) {
        handlerResp
          .then(response => {
            cb.onSuccess(response);
          })
          .catch(error => {
            cb.onFailure(
              createResponse({
                request,
                data: { error },
                status: 500,
                statusText: 'Mock server internal error',
                headers: {},
              }),
            );
          });
      } else {
        cb.onSuccess(handlerResp);
      }
    };
  }
}

export class MockGlipServer implements IMockServer {
  private _router: Router;
  postDao: GlipPostDao;
  itemDao: GlipItemDao;
  groupDao: GlipGroupDao;
  stateDao: GlipStateDao;
  personDao: GlipPersonDao;
  profileDao: GlipProfileDao;
  api: IGlipApi = {
    // todo implements some api
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
  clientConfigDao: GlipClientConfigDao;

  constructor() {
    this._router = new Router((routePath, path) => {
      return routePath === path || routePath === '*';
    });
    const db = new LokiDB(schema);
    this.postDao = new GlipPostDao(db);
    this.itemDao = new GlipItemDao(db);
    this.groupDao = new GlipGroupDao(db);
    this.stateDao = new GlipStateDao(db);
    this.personDao = new GlipPersonDao(db);
    this.profileDao = new GlipProfileDao(db);
    this.clientConfigDao = new GlipClientConfigDao(db);
    const adapter: IResponseAdapter = new AdapterImpl();

    _.keys(this.api).forEach(path => {
      _.keys(this.api[path]).forEach(verb => {
        const routerHandler = adapter.adapt(request =>
          this.api[path][verb](request),
        );
        this._router.use(verb, path, routerHandler);
      });
    });

    this._router.use('get', '*', this._handleCommon);
    this._router.use('put', '*', this._handleCommon);
    this._router.use('post', '*', this._handleCommon);
  }

  login = (request: IRequest) => {
    // console.log('TCL: MockGlipServer -> login -> request', request);

    return createResponse({
      status: 200,
      statusText: '[mock] login success',
    });
  }

  getInitialData = async (request: IRequest<any>) => {
    const initialData: InitialData = {
      user_id: data.templates.user._id!,
      company_id: data.templates.company.id,
      profile: data.templates.profile,
      companies: [data.templates.company],
      state: data.templates.state,
      people: [data.templates.user, ...data.templates.people],
      groups: data.templates.groups,
      teams: data.templates.teams,
      client_config: data.templates.clientConfig,
      static_http_server: 'https://d2rbro28ib85bu.cloudfront.net',
    };
    // const initialData: InitialData = {
    //   user_id: data.templates.user._id!,
    //   company_id: data.templates.company.id,
    //   profile: data.templates.profile,
    //   companies: [data.templates.company],
    //   state: data.templates.state,
    //   people: [data.templates.user, ...data.templates.people],
    //   groups: data.templates.groups,
    //   teams: data.templates.teams,
    //   client_config: data.templates.clientConfig,
    //   static_http_server: 'https://d2rbro28ib85bu.cloudfront.net',
    // };
    return createResponse({
      data: initialData,
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
    return createResponse({
      request,
      data: this.postDao.put(request.data),
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
