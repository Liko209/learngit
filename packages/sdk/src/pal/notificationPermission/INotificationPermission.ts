/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-24 13:18:36
 * Copyright © RingCentral. All rights reserved.
 */
enum PERMISSION {
  GRANTED = 'granted',
  DEFAULT = 'default',
  DENIED = 'denied',
}
interface INotificationPermission {
  request: () => Promise<NotificationPermission>;
  current: NotificationPermission;
  isGranted: boolean;
}

export { INotificationPermission, PERMISSION };
