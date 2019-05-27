/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 11:08:28
 * Copyright © RingCentral. All rights reserved.
 */

import {
  GeneralModuleSetting,
  NotificationModuleSetting,
  MessageModuleSetting,
  PhoneModuleSetting,
  MeetingModuleSetting,
  CalendarModuleSetting,
} from '../ModuleSettings';
import { SettingModuleIds } from '../constants';
import { ServiceConfig } from '../../serviceLoader';

const ModuleSettingClass = [
  GeneralModuleSetting,
  NotificationModuleSetting,
  MessageModuleSetting,
  PhoneModuleSetting,
  MeetingModuleSetting,
  CalendarModuleSetting,
];

const SettingId2Service = {
  [SettingModuleIds.RegionSetting.id]: ServiceConfig.RC_INFO_SERVICE,
  [SettingModuleIds.ExtensionSetting.id]: ServiceConfig.RC_INFO_SERVICE,
};

const SupportSettingServices = [
  ServiceConfig.COMPANY_SERVICE,
  ServiceConfig.GROUP_SERVICE,
  ServiceConfig.USER_CONFIG_SERVICE,
  ServiceConfig.GLOBAL_CONFIG_SERVICE,
  ServiceConfig.GROUP_CONFIG_SERVICE,
  ServiceConfig.PERMISSION_SERVICE,
  ServiceConfig.PERSON_SERVICE,
  ServiceConfig.POST_SERVICE,
  ServiceConfig.PRESENCE_SERVICE,
  ServiceConfig.PROFILE_SERVICE,
  ServiceConfig.PROGRESS_SERVICE,
  ServiceConfig.RC_INFO_SERVICE,
  ServiceConfig.SEARCH_SERVICE,
  ServiceConfig.STATE_SERVICE,
  ServiceConfig.SYNC_SERVICE,
  ServiceConfig.TELEPHONY_SERVICE,
  ServiceConfig.ITEM_SERVICE,
];

export { ModuleSettingClass, SettingId2Service, SupportSettingServices };
