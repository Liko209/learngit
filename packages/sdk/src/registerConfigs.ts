/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:37
 * Copyright © RingCentral. All rights reserved.
 */
import { Container } from 'foundation/ioc';
import { NetworkManager, OAuthTokenManager } from 'foundation/network';
import { GlipAccount, RCAccount } from './account';
import {
  AutoAuthenticator,
  RCPasswordAuthenticator,
  UnifiedLoginAuthenticator,
  GlipAuthenticator,
} from './authenticator';
import { daoManager } from './dao';
import DaoManager from './dao/DaoManager';
import { AccountManager, ServiceManager } from './framework';
import Sdk from './Sdk';
// Service
import { AccountService } from './module/account';
import { CompanyService } from './module/company';
import { ItemService } from './module/item';
import { PersonService } from './module/person';
import { PresenceService } from './module/presence';
import { ProfileService } from './module/profile';
import { GroupConfigService } from './module/groupConfig';
import socketManager from './service/socket';
import { SocketManager } from './service/socket/SocketManager';
import { StateService } from './module/state';
import { SyncService } from './module/sync';
import { TelephonyService } from './module/telephony';
import { ProgressService } from './module/progress';
import { PostService } from './module/post';
import { PermissionService } from './module/permission';
import { GroupService } from './module/group';
import { SearchService } from './module/search';
import { RCInfoService } from './module/rcInfo';
import { SettingService } from './module/setting';
import {
  GlobalConfigService,
  UserConfigService,
  DBConfigService,
} from './module/config';
import { ServiceConfig } from './module/serviceLoader';
import { PhoneNumberService } from './module/phoneNumber';
import { RCEventSubscriptionService } from './module/rcEventSubscription';
import { CallLogService } from './module/RCItems/callLog';
import { VoicemailService } from './module/RCItems/voicemail';
import { BadgeService } from './module/badge';
import { MeetingsService } from './module/meetings';

const networkManager = new NetworkManager(new OAuthTokenManager());

const registerConfigs = {
  classes: [
    { name: 'GlobalConfigService', value: GlobalConfigService },
    { name: 'UserConfigService', value: UserConfigService },
    { name: 'DBConfigService', value: DBConfigService },
    // Authenticator
    { name: RCPasswordAuthenticator.name, value: RCPasswordAuthenticator },
    { name: AutoAuthenticator.name, value: AutoAuthenticator },
    { name: UnifiedLoginAuthenticator.name, value: UnifiedLoginAuthenticator },
    { name: GlipAuthenticator.name, value: GlipAuthenticator },

    // Account
    { name: RCAccount.name, value: RCAccount },
    { name: GlipAccount.name, value: GlipAccount },

    // Services
    { name: ServiceConfig.COMPANY_SERVICE, value: CompanyService },
    { name: ServiceConfig.ITEM_SERVICE, value: ItemService },
    { name: ServiceConfig.PERSON_SERVICE, value: PersonService },
    { name: ServiceConfig.PRESENCE_SERVICE, value: PresenceService },
    { name: ServiceConfig.PROFILE_SERVICE, value: ProfileService },
    {
      name: ServiceConfig.STATE_SERVICE,
      value: StateService,
      injects: [ServiceConfig.GROUP_SERVICE],
    },
    { name: ServiceConfig.PROGRESS_SERVICE, value: ProgressService },
    {
      name: ServiceConfig.POST_SERVICE,
      value: PostService,
      injects: [
        ServiceConfig.GROUP_SERVICE,
        ServiceConfig.GROUP_CONFIG_SERVICE,
      ],
    },
    { name: ServiceConfig.PERMISSION_SERVICE, value: PermissionService },
    {
      name: ServiceConfig.GROUP_SERVICE,
      value: GroupService,
      injects: [ServiceConfig.GROUP_CONFIG_SERVICE],
    },
    { name: ServiceConfig.RC_INFO_SERVICE, value: RCInfoService },
    {
      name: ServiceConfig.ACCOUNT_SERVICE,
      value: AccountService,
      injects: [AccountManager.name],
    },
    { name: ServiceConfig.SYNC_SERVICE, value: SyncService },
    {
      name: ServiceConfig.TELEPHONY_SERVICE,
      value: TelephonyService,
      injects: [
        ServiceConfig.PERSON_SERVICE,
        ServiceConfig.PHONE_NUMBER_SERVICE,
        ServiceConfig.RC_INFO_SERVICE,
      ],
    },
    { name: ServiceConfig.GROUP_CONFIG_SERVICE, value: GroupConfigService },
    { name: ServiceConfig.SEARCH_SERVICE, value: SearchService },
    { name: ServiceConfig.SETTING_SERVICE, value: SettingService },
    { name: ServiceConfig.PHONE_NUMBER_SERVICE, value: PhoneNumberService },
    {
      name: ServiceConfig.RC_EVENT_SUBSCRIPTION_SERVICE,
      value: RCEventSubscriptionService,
    },
    { name: ServiceConfig.BADGE_SERVICE, value: BadgeService },
    { name: ServiceConfig.CALL_LOG_SERVICE, value: CallLogService },
    { name: ServiceConfig.VOICEMAIL_SERVICE, value: VoicemailService },
    { name: ServiceConfig.BADGE_SERVICE, value: BadgeService },
    { name: ServiceConfig.MEETINGS_SERVICE, value: MeetingsService },

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
        ServiceConfig.SYNC_SERVICE,
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
