import assert from 'assert';
import { LokiDB } from 'foundation/db';
import _ from 'lodash';
import { Post } from 'sdk/module/post/entity/Post';

import { Router } from '../Router';
import { IJRequest, IRoute, IApiContract } from '../../../types';
import { createResponse, String2Number } from '../utils';
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
import {
  GlipData,
  InitialData,
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
import { createDebug } from 'sdk/__tests__/utils';
import { GlipBaseDao } from './GlipBaseDao';
// import { GlipController } from './api/glip';
import {
  getMeta,
  // getPrototypeDefineFunctions,
} from '../../../decorators/metaUtil';
import { META_ROUTE } from '../../../decorators/constants';
import { Route } from '../../../decorators/Route.decorator';
const debug = createDebug('MockGlipServer');


export class MockGlipServer {
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

  constructor() {
    this.socketServer = new MockSocketServer('https://glip.socket.com');
    this._router = new Router();
    // todo apply Route from sub Controller
    const routeMetas = getMeta<IRoute<IApiContract>>(
      MockGlipServer.prototype,
      META_ROUTE,
    );
    routeMetas.map(({ key, meta }) => {
      const { method = 'get', path, query = {} } = meta;
      this._router.use(method, path, (request, queryObject = {}) => {
        const queryParams = { ...queryObject };
        Object.entries(query).forEach(([key, value]) => {
          queryParams[key] = (value as any)(queryObject[key]);
        });
        // todo dynamic inject Request, body, query
        return this[key](request, queryParams);
      });
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

  @Route({
    path: '/api/login',
    method: 'put',
  })
  login(request: IJRequest) {
    return createResponse({
      status: 200,
      statusText: '[mock] login success',
    });
  }

  @Route({
    path: '/api/index',
  })
  index(request: IJRequest) {
    return createResponse({
      data: {},
      status: 200,
      statusText: '[mock] login success',
    });
  }

  @Route({
    path: '/v1.0/desktop/remaining',
  })
  remaining(request: IJRequest) {
    return createResponse({
      data: {},
      status: 200,
      statusText: '[mock] login success',
    });
  }

  @Route({
    path: '/v1.0/desktop/initial',
  })
  async getInitialData(request: IJRequest<any>) {
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
      scoreboard: 'glip.socket.com',
      // static_http_server: 'https://d2rbro28ib85bu.cloudfront.net',
    };
    return createResponse({
      data: buildInitialData,
    });
  }

  @Route({
    path: '/api/posts',
  })
  async getPosts(request: IJRequest) {
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByGroupId(group_id),
        items: await this.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  @Route({
    path: '/api/posts_items_by_ids',
  })
  async getPostsItemsByIds(request: IJRequest) {
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

  @Route({
    path: '/api/post',
    method: 'post',
  })
  async createPost(request: IJRequest<Post>) {
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

  @Route({
    path: '/api/save_state_partial/:id?',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  saveStatePartial(request: IJRequest<GlipState>, query: { id: number }) {
    debug('handle saveStatePartial -> request', query);
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

  @Route({
    path: '/api/group',
    method: 'post',
  })
  createGroup(request: IJRequest<GlipGroup>) {
    const serverGroup = this.dataHelper.group.factory.build(request.data);
    this.groupDao.put(serverGroup);
    this.socketServer.emitEntityCreate(serverGroup);
    return createResponse({
      request,
      data: serverGroup,
    });
  }

  @Route({
    path: '/api/group/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateGroup(request: IJRequest<GlipGroup>, routeParams: object) {
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

  @Route({
    path: '/api/team',
    method: 'post',
  })
  createTeam(request: IJRequest<GlipGroup>) {
    const serverTeam = this.dataHelper.team.factory.build(request.data);
    this.groupDao.put(serverTeam);
    this.socketServer.emitEntityCreate(serverTeam);
    return createResponse({
      request,
      data: serverTeam,
    });
  }

  @Route({
    path: '/api/team/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateTeam(request: IJRequest<GlipGroup>, routeParams: object) {
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

  @Route({
    path: '/api/profile/:id',
    method: 'get',
    query: {
      id: String2Number,
    },
  })
  getProfile(request: IJRequest<GlipProfile>, routeParams: object) {
    assert(routeParams['id'], 'get profile lack ok id');
    return createResponse({
      request,
      data: this.profileDao.getById(Number(routeParams['id'])),
    });
  }

  @Route({
    path: '/api/profile/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateProfile(request: IJRequest<GlipProfile>, routeParams: object) {
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

  getRouter = () => this._router;
}
