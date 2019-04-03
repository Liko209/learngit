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

const itemService = ItemService.getInstance() as ItemService;

class MessageModule extends AbstractModule {
  @inject(LEAVE_BLOCKER_SERVICE) _leaveBlockerService: ILeaveBlockerService;

  handleLeave = () => {
    return itemService.hasUploadingFiles();
  }

  async bootstrap() {
    this._leaveBlockerService.onLeave(this.handleLeave);
  }

  dispose() {
    this._leaveBlockerService.offLeave(this.handleLeave);
  }
}

export { MessageModule };
