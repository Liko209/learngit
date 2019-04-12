/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import {
  ILeaveBlockerService,
  LEAVE_BLOCKER_SERVICE,
} from '../leave-blocker/interface';
import { ItemService } from 'sdk/module/item/service';

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MessageNotificationManager } from './MessageNotificationManager';
import { MESSAGE_NOTIFICATION_MANAGER } from './interface/constant';

const itemService = ServiceLoader.getInstance<ItemService>(
  ServiceConfig.ITEM_SERVICE,
);

class MessageModule extends AbstractModule {
  @inject(LEAVE_BLOCKER_SERVICE) _leaveBlockerService: ILeaveBlockerService;
  @inject(MESSAGE_NOTIFICATION_MANAGER)
  _messageNotificationManager: MessageNotificationManager;
  handleLeave = () => {
    return itemService.hasUploadingFiles();
  }

  async bootstrap() {
    this._messageNotificationManager.init();
    this._leaveBlockerService.onLeave(this.handleLeave);
  }

  dispose() {
    this._messageNotificationManager.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);
  }
}

export { MessageModule };
