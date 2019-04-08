/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';
export interface INotificationService {
  init: Function;
  show: (title: string, options?: SWNotificationOptions) => void;
  close: (scope: string, id: number | string) => void;
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
  data: { id: number | string; scope: string };
  actions?: notificationAction[];
};

export type Global = {
  Notification: Notification;
  navigator: Navigator;
};
