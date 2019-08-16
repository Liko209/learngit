/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 11:25:42
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from 'sdk/dao';
import { Voicemail } from '../entity';
import { IDatabase } from 'foundation/db';
import { VoicemailViewDao } from './VoicemailViewDao';
import { FetchDataOptions } from '../../types';
import { AbstractComposedDao } from 'sdk/module/base/dao/AbstractComposedDao';

class VoicemailDao extends AbstractComposedDao<Voicemail, number> {
  static COLLECTION_NAME = 'voicemail';
  private _voicemailViewDao: VoicemailViewDao;

  constructor(db: IDatabase) {
    super(VoicemailDao.COLLECTION_NAME, db);
    this._voicemailViewDao = daoManager.getDao(VoicemailViewDao);
    this.addViewDaos([this._voicemailViewDao]);
  }

  async queryVoicemails(
    options: FetchDataOptions<Voicemail>,
  ): Promise<Voicemail[]> {
    const vmIds = await this._voicemailViewDao.queryVoicemails(options);
    const voicemails =
      (vmIds.length && (await this.batchGet(vmIds, true))) || [];
    return voicemails;
  }
}

export { VoicemailDao };
