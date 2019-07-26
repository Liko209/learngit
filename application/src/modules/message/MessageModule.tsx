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
import { IMessageSettingManager } from './interface';

import {
  IMessageNotificationManager,
  IMessageService,
} from '@/modules/message/interface';

const itemService = ServiceLoader.getInstance<ItemService>(
  ServiceConfig.ITEM_SERVICE,
);

class MessageModule extends AbstractModule {
  @inject(Jupiter) private _jupiter: Jupiter;
  @ILeaveBlockerService
  private _leaveBlockerService: ILeaveBlockerService;
  @IMessageNotificationManager
  private _messageNotificationManager: MessageNotificationManager;
  @IMessageSettingManager
  private _messageSettingManager: IMessageSettingManager;

  handleLeave = () => itemService.hasUploadingFiles();

  async bootstrap() {
    this._messageNotificationManager.init();
    this._leaveBlockerService.onLeave(this.handleLeave);

    this._jupiter.emitModuleInitial(IMessageService);
    this._messageSettingManager.init();
  }

  dispose() {
    this._messageNotificationManager.dispose();
    this._leaveBlockerService.offLeave(this.handleLeave);
    this._messageSettingManager.dispose();
  }
}

export { MessageModule };
