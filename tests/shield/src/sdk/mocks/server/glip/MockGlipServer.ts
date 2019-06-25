import assert from 'assert';
import { LokiDB } from 'foundation/db';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { Post } from 'sdk/module/post/entity/Post';
import { State } from 'sdk/module/state/entity/State';
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
import { schema } from './glipSchema';
import { MockSocketServer } from './MockSocketServer';
import { ResponseAdapter } from './ResponseAdapter';
import {
  GlipData,
  Handler,
  IApi,
  InitialData,
  IResponseAdapter,
  VerbHandler,
  GlipPost,
  GlipGroupState,
  GlipState,
  GlipGroup,
} from './types';
import { genPostId, parseState } from './utils';
import { GlipDataHelper } from './data/data';
import { STATE_KEYS } from './constants';

interface IGlipApi extends IApi {
  '/api/login': {
    put: Handler;
  };
  '/v1.0/desktop/initial': {
    get: Handler;
  };
  '/v1.0/desktop/remaining': {
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
  '/api/group': {
    post: Handler;
  };
  '/api/save_state_partial': {
    put: Handler;
  };
  '*': VerbHandler;
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
  socketServer: MockSocketServer;
  dataHelper: GlipDataHelper;

  api: IGlipApi = {
    '/api/login': { put: request => this.login(request) },
    '/api/posts': { get: async request => await this.getPosts(request) },
    '/api/posts_items_by_ids': {
      get: async request => await this.getPostsItemsByIds(request),
    },
    '/api/post': { post: async request => await this.createPost(request) },
    '/api/group': { post: async request => await this.createGroup(request) },
    '/api/save_state_partial': {
      put: async request => await this.saveStatePartial(request),
    },
    '/v1.0/desktop/initial': {
      get: async request => await this.getInitialData(request),
    },
    '/v1.0/desktop/remaining': {
      get: request => createResponse({ status: 500, statusText: 'Mock error' }),
    },
    '*': {
      get: request => this.commonHandler(request),
      put: request => this.commonHandler(request),
      post: request => this.commonHandler(request),
      delete: request => this.commonHandler(request),
    },
  };

  constructor() {
    const adapter: IResponseAdapter = new ResponseAdapter();
    this._router = new Router((routePath, path) => {
      return routePath === path || routePath === '*';
    },                        adapter);
    this._router.applyApi(this.api);
    this.socketServer = new MockSocketServer();
    this.init();
  }

  setDataHelper(dataHelper: GlipDataHelper) {
    this.dataHelper = dataHelper;
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
    this.companyDao.bulkPut(glipData.company);
    this.profileDao.bulkPut(glipData.profile);
    this.stateDao.bulkPut(glipData.state);
    glipData.groupState && this.groupStateDao.bulkPut(glipData.groupState);
    // this.personDao.insert(glipDataTemplate.user);
    glipData.posts && this.postDao.bulkPut(glipData.posts);
    this.personDao.bulkPut(glipData.people);
    this.groupDao.bulkPut(glipData.groups);
    this.groupDao.bulkPut(glipData.teams);
    this.clientConfigDao.bulkPut(glipData.clientConfig);
    const companyId = glipData.company['_id'];
    const userId = glipData.profile.person_id!;
    this.dataHelper = new GlipDataHelper(companyId, userId);
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
    assert(company, 'company not found.');
    // const profile = this.profileDao.findOne();
    const state = this.stateDao.findOne()!;
    const groupStates = this.groupStateDao.lokiCollection.find() || [];
    groupStates.forEach(groupState => {
      STATE_KEYS.forEach(key => {
        state[`${key}:${groupState.group_id}`] = groupState[key];
      });
    });
    const buildInitialData: InitialData = {
      state,
      user_id: user!._id,
      company_id: company!._id,
      profile: this.profileDao.findOne()!,
      companies: [company!],
      people: this.personDao.lokiCollection.find(),
      groups: await this.groupDao.getGroups(),
      teams: await this.groupDao.getTeams(),
      posts: this.postDao.getPosts() || [],
      client_config: this.clientConfigDao.findOne()!,
      timestamp: 1561008777444,
      scoreboard: 'wss://glip.socket.com',
      // static_http_server: 'https://d2rbro28ib85bu.cloudfront.net',
    };
    return createResponse({
      data: buildInitialData,
    });
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
    const serverPost: GlipPost = { _id: genPostId(), ...request.data };
    const groupId = serverPost.group_id;
    const updateResult = this.postDao.put(serverPost);
    const serverGroup = this.groupDao.getById(groupId)!;
    serverGroup.most_recent_post_id = serverPost._id;
    serverGroup.most_recent_post_created_at = serverPost.created_at;
    serverGroup.most_recent_content_modified_at = serverPost.modified_at;
    serverGroup.post_cursor += 1;
    serverGroup.last_author_id = serverPost.creator_id;
    this.groupDao.put(serverGroup);
    const groupState =
      this.groupStateDao.getById(groupId) ||
      this.dataHelper.groupState.createGroupState(groupId);
    groupState.post_cursor += 1;
    groupState.read_through = serverPost._id;
    this.groupStateDao.put(groupState);
    // emit partial serverGroup
    this.socketServer.emitEntityCreate(serverPost);
    this.socketServer.emit(
      'partial',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          partial: true,
          hint: {
            post_creator_ids: {
              [String(serverGroup._id)]: serverPost.creator_id,
            },
          },
          objects: [[{ ...serverGroup }]],
        },
      }),
    );
    this.socketServer.emit(
      'partial',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          partial: true,
          hint: {
            post_creator_ids: {
              [String(serverGroup._id)]: serverPost.creator_id,
            },
          },
          objects: [[{ ...groupState }]],
        },
      }),
    );

    // create post
    // message post
    // update group cursor
    // update person state
    // mockServer.emit('partial')
    return createResponse({
      request,
      data: updateResult,
    });
  }

  saveStatePartial = async (request: IRequest<GlipState>) => {
    console.log('TCL: MockGlipServer -> saveStatePartial -> request', request);
    const groupStates = parseState(request.data);
    if (groupStates && groupStates[0]) {
      console.log(
        'TCL: MockGlipServer -> saveStatePartial -> groupStates[0]',
        groupStates[0],
      );
      return createResponse({
        request,
        data: this.groupStateDao.put(groupStates[0]),
      });
    }
    return createResponse({
      status: 500,
      statusText: 'saveStatePartial failed',
    });
  }

  createGroup = async (request: IRequest<GlipGroup>) => {
    const serverGroup = this.dataHelper.group.factory.build(request.data);
    this.groupDao.put(serverGroup);
    this.socketServer.emitEntityCreate(serverGroup);
    return createResponse({
      request,
      data: serverGroup,
    });
  }

  handle = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    this._router.dispatch(request, cb);
  }

  commonHandler = (request: IRequest) => {
    const mockJsonPath = this.getMockJsonPath(request.host, request.path);
    if (fs.existsSync(mockJsonPath)) {
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      return createResponse({
        request,
        ...result.response,
      });
    }
    return createResponse({
      status: 404,
      statusText: 'Mock data not found',
    });
  }

  getMockJsonPath = (host: string, uri: string) => {
    const { hostname } = url.parse(host);
    const relatePath = `${hostname}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../../',
      `./testingData/http/${relatePath.replace(/\~/g, '-')}/200.json`,
    );
    return mockDataPath;
  }

  getRouter = () => this._router;
}
