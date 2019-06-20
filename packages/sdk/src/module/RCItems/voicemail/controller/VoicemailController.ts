/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 14:53:36
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';
import { VoicemailActionController } from './VoicemailActionController';
import { Voicemail } from '../entity';
import { RCItemUserConfig } from '../../config';
import { VoicemailFetchController } from './VoicemailFetchController';
import { VoicemailBadgeController } from './VoicemailBadgeController';
class VoicemailController {
  private _voicemailActionController: VoicemailActionController;
  private _voicemailFetchController: VoicemailFetchController;
  private _voicemailBadgeController: VoicemailBadgeController;
  constructor(
    private _entitySourceController: IEntitySourceController<Voicemail>,
    private _rcItemUserConfig: RCItemUserConfig,
  ) {}

  get voicemailActionController() {
    if (!this._voicemailActionController) {
      this._voicemailActionController = new VoicemailActionController(
        this._entitySourceController,
        this._buildPartialModifyController(),
      );
    }

    return this._voicemailActionController;
  }

  get voicemailFetchController() {
    if (!this._voicemailFetchController) {
      this._voicemailFetchController = new VoicemailFetchController(
        this._rcItemUserConfig,
        this._entitySourceController,
        this.voicemailBadgeController,
      );
    }
    return this._voicemailFetchController;
  }

  get voicemailBadgeController() {
    if (!this._voicemailBadgeController) {
      this._voicemailBadgeController = new VoicemailBadgeController(
        this._entitySourceController,
      );
    }
    return this._voicemailBadgeController;
  }

  private _buildPartialModifyController() {
    return new PartialModifyController(this._entitySourceController);
  }
}

export { VoicemailController };
