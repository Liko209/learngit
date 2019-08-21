/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:55:37
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';
import { ConversationType } from 'src/AnalyticsCollector/types';
import {
  MUTE_ALL,
  DESKTOP_NOTIFICATION,
  SOUND_NOTIFICATION,
  MOBILE_NOTIFICATION,
  EMAIL_NOTIFICATION,
} from './constant';
import {
  SoundSelectDataTrackingOption,
  EmailNotificationSelectDataTrackingOption,
} from '../../modules/message/MessageSettingManager/dataTrackingTransformer';
import { MOBILE_TEAM_NOTIFICATION_OPTIONS } from 'sdk/module/profile/constants';

function saveNotificationPreferences(name: string, transformFunc: Function) {
  return (value: boolean | string, type: ConversationType) =>
    dataAnalysis.track('Jup_Web/DT_msg_notificationPreferenceChange', {
      name,
      option: transformFunc(value),
      type,
    });
}
const booleanTransform = (value: boolean) => (value ? 'on' : 'off');

export const MobileNotificationDataTrackingOption: {
  [key in MOBILE_TEAM_NOTIFICATION_OPTIONS]: string
} = {
  firstonly: 'firstNewMessageOnly',
  1: 'everyMessage',
  0: 'off',
};

export function notificationPreferencesShown() {
  dataAnalysis.page('Jup_Web/DT_msg_notificationPreferences');
}

export const eventsDict = {
  [MUTE_ALL]: saveNotificationPreferences(
    'muteNotifications',
    booleanTransform,
  ),
  [DESKTOP_NOTIFICATION]: saveNotificationPreferences(
    'desktopNotification',
    booleanTransform,
  ),
  [SOUND_NOTIFICATION]: saveNotificationPreferences(
    'notificationSound',
    ({ id }: { id: string }) => SoundSelectDataTrackingOption[id],
  ),
  [MOBILE_NOTIFICATION]: saveNotificationPreferences(
    'mobileNotification',
    (value: string) => MobileNotificationDataTrackingOption[value],
  ),
  [EMAIL_NOTIFICATION]: saveNotificationPreferences(
    'emailNotification',
    (value: string) => EmailNotificationSelectDataTrackingOption[value],
  ),
};
