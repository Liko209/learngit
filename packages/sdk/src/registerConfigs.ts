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
// Service
import AccountService from './service/account';
import AuthService from './service/auth';
import { CompanyService } from './module/company';
import ConfigService from './service/config';
import { ItemService } from './module/item';
import { PersonService } from './module/person';
import { PresenceService } from './module/presence';
import { ProfileService } from './module/profile';
import GroupConfigService from './service/groupConfig';
import socketManager from './service/socket';
import { SocketManager } from './service/socket/SocketManager';
import { StateService } from './module/state';
import { SyncService } from './module/sync';
import { TelephonyService } from './module/telephony';
import { ProgressService } from './module/progress';
import { PostService } from './module/post';
import { PermissionService } from './module/permission';
import { GroupService } from './module/group';
import { RcInfoService } from './module/rcInfo';

const networkManager = new NetworkManager(new OAuthTokenManager());

const registerConfigs = {
  classes: [
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
    { name: GroupService.name, value: GroupService },
    { name: CompanyService.name, value: CompanyService },
    { name: ItemService.name, value: ItemService },
    { name: PersonService.name, value: PersonService },
    { name: PresenceService.name, value: PresenceService },
    { name: ProfileService.name, value: ProfileService },
    { name: StateService.name, value: StateService },
    { name: ProgressService.name, value: ProgressService },
    { name: PostService.name, value: PostService },
    { name: PermissionService.name, value: PermissionService },
    { name: GroupService.name, value: GroupService },
    { name: RcInfoService.name, value: RcInfoService },
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
    { name: GroupConfigService.name, value: GroupConfigService },

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
    { name: NetworkManager.name, value: networkManager },
  ],
};

export { registerConfigs };
