/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:37
 * Copyright © RingCentral. All rights reserved.
 */
import { Container, NetworkManager, OAuthTokenManager } from 'foundation';
import { GlipAccount, RCAccount } from './account';
import {
  AutoAuthenticator,
  RCPasswordAuthenticator,
  UnifiedLoginAuthenticator,
} from './authenticator';
import { daoManager } from './dao';
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager } from './framework';
import Sdk from './Sdk';
// DAO
// import AccountDao from './dao/account';
// import PostDao from './dao/post';
// import GroupDao from './dao/group';
// import CompanyDao from './dao/company';
// import ItemDao from './dao/item';
// import PersonDao from './dao/person';
// import ProfileDao from './dao/profile';
// import StateDao from './dao/state';
// import ConfigDao from './dao/config';
// import AuthDao from './dao/auth';
// Service
import AccountService from './service/account';
import AuthService from './service/auth';
import CompanyService from './service/company';
import ConfigService from './service/config';
import GroupService from './service/group';
import ItemService from './service/item';
import PersonService from './service/person';
import PostService from './service/post';
import PresenceService from './service/presence';
import ProfileService from './service/profile';
import SearchService from './service/search';
import socketManager from './service/socket';
import { SocketManager } from './service/socket/SocketManager';
import { SplitIO } from './service/splitio';
import StateService from './service/state';
import SyncService from './service/sync';
import TelephonyService from './module/telephony';

const networkManager = new NetworkManager(new OAuthTokenManager());

const registerConfigs = {
  classes: [
    // DAOs
    // { name: AccountDao.name, value: AccountDao },
    // { name: PostDao.name, value: PostDao },
    // { name: GroupDao.name, value: GroupDao },
    // { name: CompanyDao.name, value: CompanyDao },
    // { name: ItemDao.name, value: ItemDao },
    // { name: PersonDao.name, value: PersonDao },
    // { name: ProfileDao.name, value: ProfileDao },
    // { name: StateDao.name, value: StateDao },
    // { name: ConfigDao.name, value: ConfigDao },
    // { name: AuthDao.name, value: AuthDao },

    // Authenticator
    { name: RCPasswordAuthenticator.name, value: RCPasswordAuthenticator },
    {
      name: AutoAuthenticator.name,
      value: AutoAuthenticator,
      injects: [DaoManager.name],
    },
    { name: UnifiedLoginAuthenticator.name, value: UnifiedLoginAuthenticator },

    // Account
    { name: RCAccount.name, value: RCAccount },
    { name: GlipAccount.name, value: GlipAccount },

    // Services
    { name: PostService.name, value: PostService },
    { name: GroupService.name, value: GroupService },
    { name: CompanyService.name, value: CompanyService },
    { name: ItemService.name, value: ItemService },
    { name: PersonService.name, value: PersonService },
    { name: PresenceService.name, value: PresenceService },
    { name: ProfileService.name, value: ProfileService },
    { name: SearchService.name, value: SearchService },
    { name: StateService.name, value: StateService },
    {
      name: ConfigService.name,
      value: ConfigService,
      injects: [AuthService.name],
    },
    {
      name: AuthService.name,
      value: AuthService,
      injects: [AccountManager.name],
    },
    { name: AccountService.name, value: AccountService },
    { name: SyncService.name, value: SyncService },
    { name: TelephonyService.name, value: TelephonyService },
    // Manager
    {
      name: AccountManager.name,
      value: AccountManager,
      injects: [Container.name, ServiceManager.name],
    },
    {
      name: ServiceManager.name,
      value: ServiceManager,
      injects: [Container.name],
    },

    // Sdk
    {
      name: Sdk.name,
      value: Sdk,
      injects: [
        DaoManager.name,
        AccountManager.name,
        ServiceManager.name,
        NetworkManager.name,
        SyncService.name,
      ],
    },
  ],
  asyncClasses: [],
  constants: [
    // TODO register as class instead
    { name: DaoManager.name, value: daoManager },
    { name: SocketManager.name, value: socketManager },
    { name: SplitIO.name, value: new SplitIO() },
    { name: NetworkManager.name, value: networkManager },
  ],
};

export { registerConfigs };
