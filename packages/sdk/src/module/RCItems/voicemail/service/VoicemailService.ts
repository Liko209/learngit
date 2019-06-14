/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 13:41:50
 * Copyright © RingCentral. All rights reserved.
 */

import { Voicemail } from '../entity';
import { EntityBaseService } from 'sdk/framework';
import { daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { VoicemailDao } from '../dao';
import { DEFAULT_FETCH_SIZE, READ_STATUS } from '../../constants';
import { FetchResult } from '../../types';
import { RCItemUserConfig } from '../../config';
import { MODULE_NAME } from '../constants';
import { VoicemailController } from '../controller';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { SUBSCRIPTION } from 'sdk/service';

class VoicemailService extends EntityBaseService<Voicemail> {
  private _rcItemUserConfig: RCItemUserConfig;
  private _voicemailController: VoicemailController;
  constructor() {
    super(false, daoManager.getDao(VoicemailDao));
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SUBSCRIPTION.MESSAGE_STORE]: this._triggerSilentSync,
      }),
    );
  }

  onStarted() {
    super.onStarted();
    this._getVoicemailController().voicemailFetchController.init();
    this._getVoicemailController().voicemailBadgeController.init();
  }

  onStopped() {
    super.onStopped();
    this._getVoicemailController().voicemailFetchController.dispose();
    this._getVoicemailController().voicemailBadgeController.dispose();
  }

  private get userConfig(): RCItemUserConfig {
    if (!this._rcItemUserConfig) {
      this._rcItemUserConfig = new RCItemUserConfig(MODULE_NAME);
    }
    return this._rcItemUserConfig;
  }

  async requestSyncNewer() {
    this._getVoicemailController().voicemailFetchController.requestSync();
  }

  async fetchVoicemails(
    limit = DEFAULT_FETCH_SIZE,
    direction = QUERY_DIRECTION.OLDER,
    anchorId?: number,
  ): Promise<FetchResult<Voicemail>> {
    return this._getVoicemailController().voicemailFetchController.fetchVoicemails(
      limit,
      direction,
      anchorId,
    );
  }

  async updateReadStatus(messageId: number, toStatus: READ_STATUS) {
    return await this._getVoicemailController().voicemailActionController.updateReadStatus(
      messageId,
      toStatus,
    );
  }

  async downloadTranscription(id: number): Promise<string> {
    // todo
    return 'This is transcription.';
  }

  async buildDownloadUrl(originalUrl: string): Promise<string> {
    return await this._getVoicemailController().voicemailActionController.buildDownloadUrl(
      originalUrl,
    );
  }

  async deleteVoicemails(ids: number[]) {
    return await this._getVoicemailController().voicemailActionController.deleteRcMessages(
      ids,
      false,
    );
  }

  async clearAllVoicemails() {
    return await this._getVoicemailController().voicemailFetchController.clearAll();
  }

  private _getVoicemailController() {
    if (!this._voicemailController) {
      this._voicemailController = new VoicemailController(this.getEntitySource(), this.userConfig);
    }
    return this._voicemailController;
  }

  private _triggerSilentSync = async () => {
    await this._getVoicemailController().voicemailFetchController.handleNotification();
  }
}

export { VoicemailService };
