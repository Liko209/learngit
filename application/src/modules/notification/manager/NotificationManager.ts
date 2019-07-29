/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import { Presence } from 'sdk/module/presence/entity';
import PresenceModel from '@/store/models/Presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { INotificationService, NotificationOpts } from '../interface';

type NotificationId = number | string;

export abstract class AbstractNotificationManager {
  @INotificationService
  private _notificationService: INotificationService;

  constructor(protected _scope: string) {}

  show(title: string, opts: NotificationOpts) {
    this._notificationService.show(title, opts);
  }

  close(id: NotificationId) {
    this._notificationService.close(this._scope, id);
  }

  clear() {
    this._notificationService.clear(this._scope);
  }
}
