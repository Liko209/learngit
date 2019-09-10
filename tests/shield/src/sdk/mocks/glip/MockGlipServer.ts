/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:30
 * Copyright © RingCentral. All rights reserved.
 */
import assert from 'assert';
import { LokiDB } from 'foundation/db';
import _ from 'lodash';
import { createDebug } from 'sdk/__tests__/utils';
import {
  IMockServer,
  IResponseAdapter,
  JRequestHandler,
} from 'shield/sdk/types';

import { Route } from 'shield/sdk/decorators/Route.decorator';
import { globalConfig } from 'shield/sdk/globalConfig';
import { CommonFileServer } from 'shield/sdk/server/CommonFileServer';
import { InstanceManager } from 'shield/sdk/server/InstanceManager';
import { MockSocketServer } from 'shield/sdk/server/MockSocketServer';
import { ResponseAdapter } from 'shield/sdk/server/ResponseAdapter';
import { Router } from 'shield/sdk/server/Router';
import { SocketServerManager } from 'shield/sdk/server/SocketServerManager';
import { createResponse } from 'shield/sdk/utils';
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
import { GlipController } from './GlipController';
import { schema } from './glipSchema';
import { IGlipServerContext } from './IGlipServerContext';
import { GlipData, InitialData } from './types';

const debug = createDebug('MockGlipServer');
const GLIP_SOCKET_HOST = 'glip';

export class MockGlipServer implements IGlipServerContext, IMockServer {
  adapter: IResponseAdapter = new ResponseAdapter();

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
    this.socketServer = SocketServerManager.get(GLIP_SOCKET_HOST); // new MockSocketServer(`https://${GLIP_SOCKET_HOST}`);
    this._router = new Router();
    this._router.applyRoute(MockGlipServer, this, this);
    this._router.applyRoute(GlipController, new GlipController(), this);

    this.init();
  }

  handleRequest: JRequestHandler = (request: any, listener: any) => {
    if (this._router.match(request)) {
      return this.adapter.adapt(this._router.dispatch)(request, listener);
    }
    return InstanceManager.get(CommonFileServer).handleRequest(
      request,
      listener,
    );
  };

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
    glipData.posts.length && this.postDao.bulkPut(glipData.posts);
    this.personDao.bulkPut(glipData.people);
    this.groupDao.bulkPut(glipData.groups);
    this.groupDao.bulkPut(glipData.teams);
    this.clientConfigDao.bulkPut(glipData.clientConfig);
    const companyId = glipData.company['_id'];
    const userId = glipData.profile.person_id!;
    this.dataHelper = new GlipDataHelper(companyId, userId);
  };

  @Route({
    path: '/api/login',
    method: 'put',
  })
  login() {
    if (globalConfig.get('mode') === 'glip') {
      return createResponse({
        headers: {
          'x-authorization': 'mock-x-authorization',
        },
        status: 200,
        statusText: '[mock] glip login success',
      });
    }
    return createResponse({
      status: 500,
      statusText: 'rc only mode, login failed.',
    });
  }

  @Route({
    path: '/api/index',
  })
  index() {
    return createResponse({
      data: {},
      status: 200,
      statusText: '[mock] success',
    });
  }

  @Route({
    path: '/v1.0/desktop/remaining',
  })
  remaining() {
    return createResponse({
      data: {},
      status: 200,
      statusText: '[mock] success',
    });
  }

  @Route({
    path: '/v1.0/desktop/initial',
  })
  async getInitialData() {
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
      people: this.personDao.find(),
      groups: await this.groupDao.getGroups(),
      teams: await this.groupDao.getTeams(),
      public_teams: [],
      items: [],
      posts: this.postDao.getPosts() || [],
      client_config: this.clientConfigDao.findOne()!,
      timestamp: 1561008777444,
      scoreboard: GLIP_SOCKET_HOST,
    };
    return createResponse({
      data: buildInitialData,
    });
  }
}

