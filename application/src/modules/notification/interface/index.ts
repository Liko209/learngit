/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';
import { createDecorator } from 'framework';

type NotificationId = number | string;
const INotificationService = createDecorator('NOTIFICATION_SERVICE');

interface INotificationService {
  init: Function;
  show: (title: string, options?: NotificationOpts) => void;
  close: (scope: string, id: NotificationId) => void;
  clear: (scope?: string) => void;
}

type NotificationActionHandler = (event: Event) => any;
type NotificationAction = {
  title: string;
  icon: string;
  action: string;
  handler: NotificationActionHandler;
};

type NotificationOpts = Omit<NotificationOptions, 'actions'> & {
  data: { id: NotificationId; scope: string; priority: NOTIFICATION_PRIORITY };
  actions?: NotificationAction[];
  onClick?: NotificationActionHandler;
};

type Global = {
  Notification: Notification;
  navigator: Navigator;
};

enum NOTIFICATION_PRIORITY {
  INCOMING_CALL = 1,
  MESSAGE,
  INFORMATION,
}

export {
  INotificationService,
  NotificationActionHandler,
  NotificationAction,
  NotificationOpts,
  Global,
  NOTIFICATION_PRIORITY,
};
