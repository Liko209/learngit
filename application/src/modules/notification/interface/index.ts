/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { Omit } from 'jui/foundation/utils/typeHelper';
import { createDecorator } from 'framework';
import { INotificationPermission as permissionInterface } from 'sdk/pal';
import { RINGS_TYPE, SOUNDS_TYPE } from 'sdk/module/profile';
import { IMedia } from '@/interface/media';

type NotificationId = number | string;
const INotificationService = createDecorator('NOTIFICATION_SERVICE');

interface INotificationService {
  init: Function;
  show: (title: string, options?: NotificationOpts, force?: boolean) => void;
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

const INotificationSettingManager = createDecorator(
  'NOTIFICATION_SETTING_MANAGER',
);
interface INotificationSettingManager {
  init: Function;
  dispose: Function;
}
type Sounds = RINGS_TYPE | SOUNDS_TYPE;

const INotificationPermission = createDecorator('NOTIFICATION_PERMISSION');
interface INotificationPermission extends permissionInterface {}

const ISoundNotification = createDecorator('SOUND_NOTIFICATION');
interface ISoundNotification {
  create: (sound: Sounds, track: string) => IMedia | undefined;
}
export {
  Sounds,
  ISoundNotification,
  INotificationService,
  NotificationActionHandler,
  NotificationAction,
  NotificationOpts,
  Global,
  NOTIFICATION_PRIORITY,
  INotificationSettingManager,
  INotificationPermission,
};
