/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:55:37
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';
import { ConversationType } from 'src/AnalyticsCollector/types';
import {
  MUTED,
  DESKTOP_NOTIFICATIONS,
  SOUND_NOTIFICATIONS,
  MOBILE_NOTIFICATIONS,
  EMAIL_NOTIFICATIONS,
} from './constant';
import {
  SoundSelectDataTrackingOption,
  EmailNotificationSelectDataTrackingOption,
} from '../../modules/message/MessageSettingManager/dataTrackingTransformer';
import { MOBILE_TEAM_NOTIFICATION_OPTIONS } from 'sdk/module/profile/constants';

const _trackPreferenceChange = (obj: {
  name: string;
  type: ConversationType;
  option: string;
}) => {
  dataAnalysis.track('Jup_Web/DT_msg_notificationPreferenceChange', obj);
};

const _transformBoolean = (value: boolean) => (value ? 'on' : 'off');

const _buildCustomTracker = (name: string, transformFunc: Function) => (
  value: string,
  type: ConversationType,
) => _trackPreferenceChange({ name, type, option: transformFunc(value) });

const _buildBooleanTracker = (name: string) => (
  value: boolean,
  type: ConversationType,
) => _trackPreferenceChange({ name, type, option: _transformBoolean(value) });

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
  [MUTED]: _buildBooleanTracker('muteNotifications'),
  [DESKTOP_NOTIFICATIONS]: _buildBooleanTracker('desktopNotification'),
  [SOUND_NOTIFICATIONS]: _buildCustomTracker(
    'notificationSound',
    ({ id }: { id: string }) => SoundSelectDataTrackingOption[id],
  ),
  [MOBILE_NOTIFICATIONS]: _buildCustomTracker(
    'mobileNotification',
    (value: string) => MobileNotificationDataTrackingOption[value],
  ),
  [EMAIL_NOTIFICATIONS]: _buildCustomTracker(
    'emailNotification',
    (value: string) => EmailNotificationSelectDataTrackingOption[value],
  ),
};
