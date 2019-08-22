/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-16 14:31:56
 * Copyright © RingCentral. All rights reserved.
 */

const MUTE_ALL = 'muteAll';
const DESKTOP_NOTIFICATION = 'desktopNotification';
const SOUND_NOTIFICATION = 'soundNotification';
const MOBILE_NOTIFICATION = 'mobileNotification';
const EMAIL_NOTIFICATION = 'emailNotification';

const TO_CAMEL_DICT = {
  muted: MUTE_ALL,
  desktop_notifications: DESKTOP_NOTIFICATION,
  sound_notifications: SOUND_NOTIFICATION,
  push_notifications: MOBILE_NOTIFICATION,
  email_notifications: EMAIL_NOTIFICATION,
};
export {
  MUTE_ALL,
  DESKTOP_NOTIFICATION,
  SOUND_NOTIFICATION,
  MOBILE_NOTIFICATION,
  EMAIL_NOTIFICATION,
  TO_CAMEL_DICT,
};
