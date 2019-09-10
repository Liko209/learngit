/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-04 20:25:36
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntityNotificationController } from 'sdk/framework/controller/interface/IEntityNotificationController';
import { Voicemail } from '../entity';
import { MESSAGE_AVAILABILITY } from '../../constants';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { notificationCenter } from 'sdk/service';

class VoicemailHandleDataController {
  constructor(
    private _notificationController: IEntityNotificationController<Voicemail>,
    private _sourceController: IEntitySourceController<Voicemail>,
  ) {}

  handleVoicemailEvent = async (data: Voicemail) => {
    await this._sourceController.update(data);
    notificationCenter.emitEntityUpdate<Voicemail>(
      this._sourceController.getEntityNotificationKey(),
      [data],
    );
    if (data.availability === MESSAGE_AVAILABILITY.ALIVE) {
      this._notificationController.onReceivedNotification([data]);
    }
  };
}

export { VoicemailHandleDataController };
