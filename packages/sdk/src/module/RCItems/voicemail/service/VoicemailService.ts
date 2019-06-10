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

class VoicemailService extends EntityBaseService<Voicemail> {
  private _rcItemUserConfig: RCItemUserConfig;
  private _voicemailController: VoicemailController;
  constructor() {
    super(false, daoManager.getDao(VoicemailDao));
    this._rcItemUserConfig = new RCItemUserConfig(MODULE_NAME);
  }

  onStarted() {
    super.onStarted();
    this._getVoicemailController().voicemailFetchController.init();
    this._getVoicemailController().voicemailBadgeController.init();
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

  buildDownloadUrl(originalUrl: string): string {
    return this._getVoicemailController().voicemailActionController.buildDownloadUrl(
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
      this._voicemailController = new VoicemailController(
        this.getEntitySource(),
        this._rcItemUserConfig,
      );
    }
    return this._voicemailController;
  }
}

export { VoicemailService };
