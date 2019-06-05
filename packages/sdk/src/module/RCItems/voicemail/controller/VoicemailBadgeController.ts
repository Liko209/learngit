/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-30 13:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { VOICEMAIL_BADGE_ID } from '../constants';
import { ENTITY } from 'sdk/service';
import { Voicemail } from '../entity';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { RCMessageBadgeController } from '../../common/controller/RCMessageBadgeController';

class VoicemailBadgeController extends RCMessageBadgeController<Voicemail> {
  constructor(sourceController: IEntitySourceController<Voicemail>) {
    super(ENTITY.VOICE_MAIL, VOICEMAIL_BADGE_ID, sourceController);
  }
}

export { VoicemailBadgeController };
