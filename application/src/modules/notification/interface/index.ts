/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';

type NotificationId = number | string;
export interface INotificationService {
  init: Function;
  show: (title: string, options?: NotificationOpts) => void;
  close: (scope: string, id: NotificationId) => void;
  clear: (scope?: string) => void;
}

export type NotificationActionHandler = (event: Event) => any;
export type NotificationAction = {
  title: string;
  icon: string;
  action: string;
  handler: NotificationActionHandler;
};

export type NotificationOpts = Omit<NotificationOptions, 'actions'> & {
  data: { id: NotificationId; scope: string; priority: NOTIFICATION_PRIORITY };
  actions?: NotificationAction[];
  onClick?: NotificationActionHandler;
};

export type Global = {
  Notification: Notification;
  navigator: Navigator;
};

export enum NOTIFICATION_PRIORITY {
  INCOMING_CALL = 1,
  MESSAGE,
  INFORMATION,
}
