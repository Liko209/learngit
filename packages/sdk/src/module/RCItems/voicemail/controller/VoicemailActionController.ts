/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 09:49:56
 * Copyright © RingCentral. All rights reserved.
 */
import { RcMessageActionController } from '../../common/controller/RcMessageActionController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { Voicemail } from '../entity';
import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';

const LOG_TAG = 'VoicemailActionController';

class VoicemailActionController extends RcMessageActionController<Voicemail> {
  constructor(
    entitySourceController: IEntitySourceController<Voicemail>,
    partialModifyController: IPartialModifyController<Voicemail>,
  ) {
    super(LOG_TAG, entitySourceController, partialModifyController);
  }
}

export { VoicemailActionController };
