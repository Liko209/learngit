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
  GlipProfile,
  GlipModel,
} from './types';
import { genPostId, parseState } from './utils';
import { GlipDataHelper } from './data/data';
import { STATE_KEYS } from './constants';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { GlipBaseDao } from './GlipBaseDao';
const debug = createDebug('MockGlipServer');

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
  '/api/group/:id?': {
    post: Handler;
    put: Handler;
  };
  '/api/team/:id?': {
    post: Handler;
    put: Handler;
  };
  '/api/profile/:id?': {
    get: Handler;
    put: Handler;
  };
  // '/api/group/:id': {
  // };
  '/api/save_state_partial/:id?': {
    put: Handler;
  };
  '/(.*)': VerbHandler;
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

  // TODO optimize structure
  api: IGlipApi = {
    '/api/login': { put: request => this.login(request) },
    '/api/profile/:id?': {
      get: async (...args) => await this.getProfile(...args),
      put: async (...args) => await this.updateProfile(...args),
    },
    '/api/posts': { get: async request => await this.getPosts(request) },
    '/api/posts_items_by_ids': {
      get: async request => await this.getPostsItemsByIds(request),
    },
    '/api/post': { post: async request => await this.createPost(request) },
    '/api/group/:id?': {
      post: async request => await this.createGroup(request),
      put: async (...args) => await this.updateGroup(...args),
    },
    '/api/team/:id?': {
      post: async request => await this.createTeam(request),
      put: async (...args) => await this.updateTeam(...args),
    },
    '/api/save_state_partial/:id?': {
      put: async request => await this.saveStatePartial(request),
    },
    '/v1.0/desktop/initial': {
      get: async request => await this.getInitialData(request),
    },
    '/v1.0/desktop/remaining': {
      get: request => createResponse({ status: 400, statusText: 'Mock error' }),
    },
    '/(.*)': {
      get: request => this.commonHandler(request),
      put: request => this.commonHandler(request),
      post: request => this.commonHandler(request),
      delete: request => this.commonHandler(request),
    },
  };

  constructor() {
    const adapter: IResponseAdapter = new ResponseAdapter();
    this._router = new Router(adapter);
    this._router.applyApi(this.api);
    this.socketServer = new MockSocketServer();
    this.socketServer.on('connection', () => {
      console.log(
        'TCL: =-=-=-=-=-=-MockGlipServer -> constructor -> connection',
      );
    });
    this.init();
  }

  private _doPartialUpdate<T extends GlipModel>(
    dao: GlipBaseDao<T>,
    model: T,
    cb?: (result: T) => void,
  ) {
    const id = Number(model['_id'] || model['id']);
    const updateTarget = dao.getById(id);
    if (updateTarget) {
      const result = dao.put(_.merge({}, updateTarget, model, { _id: id }));
      cb && cb(result);
      return result;
    }
    throw 'do partial update fail';
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
    glipData.posts.length && this.postDao.bulkPut(glipData.posts);
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
    const post_ids = request.params['post_ids']
      .split(',')
      .map((it: string) => Number(it));
    debug('getPostsItemsByIds %O', { post_ids });
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByPostIds(post_ids),
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
    this.socketServer.emitEntityCreate(serverPost);
    this.socketServer.emitPartial(serverGroup, {
      hint: {
        post_creator_ids: {
          [String(serverGroup._id)]: serverPost.creator_id,
        },
      },
    });
    this.socketServer.emitPartial(groupState, {
      hint: {
        post_creator_ids: {
          [String(serverGroup._id)]: serverPost.creator_id,
        },
      },
    });

    return createResponse({
      request,
      data: updateResult,
    });
  }

  saveStatePartial = async (request: IRequest<GlipState>) => {
    debug('handle saveStatePartial -> request');
    const groupStates = parseState(request.data);
    if (groupStates && groupStates[0]) {
      debug('saveStatePartial -> groupStates[0] %O', groupStates[0]);
      return createResponse({
        request,
        data: this._doPartialUpdate(
          this.groupStateDao,
          groupStates[0],
          result => this.socketServer.emitPartial(result),
        ),
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

  updateGroup = async (request: IRequest<GlipGroup>, routeParams: object) => {
    assert(routeParams['id'], 'update group lack ok id');
    return createResponse({
      request,
      data: this._doPartialUpdate(
        this.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitPartial(result),
      ),
    });
  }

  createTeam = async (request: IRequest<GlipGroup>) => {
    const serverTeam = this.dataHelper.team.factory.build(request.data);
    this.groupDao.put(serverTeam);
    this.socketServer.emitEntityCreate(serverTeam);
    return createResponse({
      request,
      data: serverTeam,
    });
  }

  updateTeam = async (request: IRequest<GlipGroup>, routeParams: object) => {
    assert(routeParams['id'], 'update team lack ok id');
    return createResponse({
      request,
      data: this._doPartialUpdate(
        this.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitPartial(result),
      ),
    });
  }

  getProfile = async (request: IRequest<GlipProfile>, routeParams: object) => {
    assert(routeParams['id'], 'get profile lack ok id');
    return createResponse({
      request,
      data: this.profileDao.getById(Number(routeParams['id'])),
    });
  }

  updateProfile = async (
    request: IRequest<GlipProfile>,
    routeParams: object,
  ) => {
    assert(routeParams['id'], 'update profile lack ok id');
    return createResponse({
      request,
      data: this._doPartialUpdate(
        this.profileDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitMessage(result),
      ),
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
