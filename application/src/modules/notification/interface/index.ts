/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';

type NotificationId = number | string;
export interface INotificationService {
  init: Function;
  show: (title: string, options?: SWNotificationOptions) => void;
  close: (scope: string, id: NotificationId) => void;
  clear: (scope?: string) => void;
}

export type notificationActionHandler = (event: Event) => any;
export type notificationAction = {
  title: string;
  icon: string;
  action: string;
  handler: notificationActionHandler;
};

export type SWNotificationOptions = Omit<NotificationOptions, 'actions'> & {
  data: { id: NotificationId; scope: string };
  actions?: notificationAction[];
};

export type Global = {
  Notification: Notification;
  navigator: Navigator;
};
