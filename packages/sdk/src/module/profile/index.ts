/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 15:33:25
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileService } from './service/ProfileService';
import {
  extractHiddenGroupIds,
  extractHiddenGroupIdsWithoutUnread,
} from './service/ProfileUtils';

export {
  ProfileService,
  extractHiddenGroupIds,
  extractHiddenGroupIdsWithoutUnread,
};

export {
  CALLING_OPTIONS,
  NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
  NEW_MESSAGE_BADGES_OPTIONS,
  DesktopNotificationsSettingModel,
  RINGS_LIST,
  SOUNDS_LIST,
} from './constants';

export { SettingValue, SettingOption } from './types';
