/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject, Jupiter } from 'framework';
import { ILeaveBlockerService } from '../leave-blocker/interface';
import { ItemService } from 'sdk/module/item/service';

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MessageNotificationManager } from './MessageNotificationManager';
import { MESSAGE_NOTIFICATION_MANAGER } from './interface/constant';

import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';

const itemService = ServiceLoader.getInstance<ItemService>(
  ServiceConfig.ITEM_SERVICE,
);

class MessageModule extends AbstractModule {
  @ILeaveBlockerService private _leaveBlockerService: ILeaveBlockerService;
  @inject(Jupiter) private _jupiter: Jupiter;
  @inject(MESSAGE_NOTIFICATION_MANAGER)
  private _messageNotificationManager: MessageNotificationManager;
  handleLeave = () => {
    return itemService.hasUploadingFiles();
  }

  async bootstrap() {
    this._messageNotificationManager.init();
    this._leaveBlockerService.onLeave(this.handleLeave);

    this._jupiter.emitModuleInitial(MESSAGE_SERVICE);
  }

  dispose() {
    this._messageNotificationManager.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);
  }
}

export { MessageModule };
