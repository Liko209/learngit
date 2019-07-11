import { GlipPostDao } from './dao/post';

import { GlipItemDao } from './dao/item';

import { GlipGroupDao } from './dao/group';

import { GlipStateDao } from './dao/state';

import { GlipPersonDao } from './dao/person';

import { GlipProfileDao } from './dao/profile';

import { GlipClientConfigDao } from './dao/clientConfig';

import { GlipCompanyDao } from './dao/company';

import { GlipGroupStateDao } from './dao/groupState';

import { MockSocketServer } from '../MockSocketServer';

import { GlipDataHelper } from './data/data';

export interface IGlipServerContext {
  postDao: GlipPostDao;
  itemDao: GlipItemDao;
  groupDao: GlipGroupDao;
  stateDao: GlipStateDao;
  personDao: GlipPersonDao;
  profileDao: GlipProfileDao;
  clientConfigDao: GlipClientConfigDao;
  companyDao: GlipCompanyDao;
  groupStateDao: GlipGroupStateDao;
  socketServer: MockSocketServer;
  dataHelper: GlipDataHelper;
}
