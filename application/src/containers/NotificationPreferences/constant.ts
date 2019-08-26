/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-16 14:31:56
 * Copyright © RingCentral. All rights reserved.
 */

const MUTED = 'muted';
const DESKTOP_NOTIFICATIONS = 'desktopNotifications';
const AUDIO_NOTIFICATIONS = 'audioNotifications';
const MOBILE_NOTIFICATIONS = 'mobileNotifications';
const EMAIL_NOTIFICATIONS = 'emailNotifications';

const TO_CAMEL_DICT = {
  muted: MUTED,
  desktop_notifications: DESKTOP_NOTIFICATIONS,
  audio_notifications: AUDIO_NOTIFICATIONS,
  push_notifications: MOBILE_NOTIFICATIONS,
  email_notifications: EMAIL_NOTIFICATIONS,
};
export {
  MUTED,
  DESKTOP_NOTIFICATIONS,
  AUDIO_NOTIFICATIONS,
  MOBILE_NOTIFICATIONS,
  EMAIL_NOTIFICATIONS,
  TO_CAMEL_DICT,
};
