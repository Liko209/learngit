/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';
export interface INotificationService {
  init: Function;
  show: (title: string, options?: NotificationOpts) => void;
  close: (scope: string, id: number) => void;
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
  data: { id: number; scope: string };
  actions?: NotificationAction[];
  onClick?: NotificationActionHandler;
};

export type Global = {
  Notification: Notification;
  navigator: Navigator;
};
