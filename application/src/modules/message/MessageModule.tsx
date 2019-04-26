/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject, ModuleManager } from 'framework';
import {
  ILeaveBlockerService,
  LEAVE_BLOCKER_SERVICE,
} from '../leave-blocker/interface';
import { ItemService } from 'sdk/module/item/service';

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MessageNotificationManager } from './MessageNotificationManager';
import { MESSAGE_NOTIFICATION_MANAGER } from './interface/constant';

import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';

const itemService = ServiceLoader.getInstance<ItemService>(
  ServiceConfig.ITEM_SERVICE,
);

class MessageModule extends AbstractModule {
  @inject(LEAVE_BLOCKER_SERVICE) _leaveBlockerService: ILeaveBlockerService;
  @inject(ModuleManager) private _moduleManager: ModuleManager;
  @inject(MESSAGE_NOTIFICATION_MANAGER)
  _messageNotificationManager: MessageNotificationManager;
  handleLeave = () => {
    return itemService.hasUploadingFiles();
  }

  async bootstrap() {
    this._messageNotificationManager.init();
    this._leaveBlockerService.onLeave(this.handleLeave);
    // await this.messageService.initialize();
    this._moduleManager.emitModuleInitial(MESSAGE_SERVICE);

    // 1. get module from container
    // 2. emit initialized listener
  }

  dispose() {
    this._messageNotificationManager.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);

    this._moduleManager.emitModuleDispose(MESSAGE_SERVICE);
  }
}

export { MessageModule };
