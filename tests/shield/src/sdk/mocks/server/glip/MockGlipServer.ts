/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:30
 * Copyright © RingCentral. All rights reserved.
 */
import assert from 'assert';
import { LokiDB } from 'foundation/db';
import _ from 'lodash';
import { createDebug } from 'sdk/__tests__/utils';

import { META_ROUTE, META_PARAM_QUERY, META_PARAM_CONTEXT, META_PARAM_REQUEST } from '../../../decorators/constants';
import { getMeta, getParamMeta } from '../../../decorators/metaUtil';
import { Route } from '../../../decorators/Route.decorator';
import { IApiContract, IJRequest, IRoute } from '../../../types';
import { Router } from '../Router';
import { createResponse } from '../utils';
import { STATE_KEYS } from './constants';
import { GlipClientConfigDao } from './dao/clientConfig';
import { GlipCompanyDao } from './dao/company';
import { GlipGroupDao } from './dao/group';
import { GlipGroupStateDao } from './dao/groupState';
import { GlipItemDao } from './dao/item';
import { GlipPersonDao } from './dao/person';
import { GlipPostDao } from './dao/post';
import { GlipProfileDao } from './dao/profile';
import { GlipStateDao } from './dao/state';
import { GlipDataHelper } from './data/data';
import { schema } from './glipSchema';
import { MockSocketServer } from './MockSocketServer';
import {
    GlipData, InitialData
} from './types';
import { GlipController } from './GlipController';
import { IGlipServerContext } from './IGlipServerContext';

const debug = createDebug('MockGlipServer');
const GLIP_SOCKET_HOST = 'glip.socket.com';

export class MockGlipServer implements IGlipServerContext {
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
    this.socketServer = new MockSocketServer(`https://${GLIP_SOCKET_HOST}`);
    this._router = new Router();
    this.applyRoute(MockGlipServer, this);
    this.applyRoute(GlipController, new GlipController());

    this.init();
  }

  applyRoute(cls: {new(...params: any): object}, instance: any) {
    const routeMetas = getMeta<IRoute<IApiContract>>(
      cls.prototype,
      META_ROUTE,
    );

    routeMetas.map(({ key, meta }) => {
      const { method = 'get', path, query = {} } = meta;
      const contextParam = getParamMeta(cls.prototype, META_PARAM_CONTEXT, key);
      const queryParam = getParamMeta(cls.prototype, META_PARAM_QUERY, key);
      const requestParam = getParamMeta(cls.prototype, META_PARAM_REQUEST, key);
      this._router.use(method, path, (request, queryObject = {}) => {
        const params: any[] = [];
        if (queryParam) {
          const queryParams = { ...queryObject };
          Object.entries(query).forEach(([key, value]) => {
            queryParams[key] = (value as any)(queryObject[key]);
          });
          params[queryParam.index] = queryParams;
        }
        if (requestParam) {
          params[requestParam.index] = request;
        }

        if (contextParam) {
          params[contextParam.index] = this;
        }
        return (instance[key] as Function).apply(instance, params);
      });
    });
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
      scoreboard: GLIP_SOCKET_HOST,
    };
    return createResponse({
      data: buildInitialData,
    });
  }

  getRouter = () => this._router;
}
