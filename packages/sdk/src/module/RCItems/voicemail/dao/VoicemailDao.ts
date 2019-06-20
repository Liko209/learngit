/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 11:25:42
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao, QUERY_DIRECTION, daoManager } from 'sdk/dao';
import { Voicemail } from '../entity';
import { IDatabase } from 'foundation';
import { VoicemailViewDao } from './VoicemailViewDao';

class VoicemailDao extends BaseDao<Voicemail> {
  static COLLECTION_NAME = 'voicemail';
  private _voicemailViewDao: VoicemailViewDao;

  constructor(db: IDatabase) {
    super(VoicemailDao.COLLECTION_NAME, db);
    this._voicemailViewDao = daoManager.getDao(VoicemailViewDao);
  }

  async put(item: Voicemail | Voicemail[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.put(item),
        Array.isArray(item)
          ? this._bulkPutVoicemailView(item)
          : this._putVoicemailView(item),
      ]);
    });
  }

  async bulkPut(array: Voicemail[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkPut(array),
        this._bulkPutVoicemailView(array),
      ]);
    });
  }

  async update(
    partialItem: Partial<Voicemail> | Partial<Voicemail>[],
  ): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.update(partialItem),
        Array.isArray(partialItem)
          ? this._bulkUpdateVoicemailViews(partialItem)
          : this._updateVoicemailView(partialItem),
      ]);
    });
  }

  async bulkUpdate(partialItems: Partial<Voicemail>[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkUpdate(partialItems),
        this._bulkUpdateVoicemailViews(partialItems),
      ]);
    });
  }

  async delete(key: number): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.delete(key),
        this._voicemailViewDao.delete(key),
      ]);
    });
  }

  async bulkDelete(keys: number[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkDelete(keys),
        this._voicemailViewDao.bulkDelete(keys),
      ]);
    });
  }

  async clear(): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.clear(), this._voicemailViewDao.clear()]);
    });
  }

  private async _updateVoicemailView(partialVM: Partial<Voicemail>) {
    await this._voicemailViewDao.update(
      this._voicemailViewDao.toPartialVoicemailView(partialVM),
    );
  }

  private async _bulkUpdateVoicemailViews(partialItems: Partial<Voicemail>[]) {
    const viewVMs = partialItems.map(vm =>
      this._voicemailViewDao.toPartialVoicemailView(vm),
    );
    this._voicemailViewDao.bulkUpdate(viewVMs);
  }

  private async _putVoicemailView(vm: Voicemail) {
    await this._voicemailViewDao.put(
      this._voicemailViewDao.toVoicemailView(vm),
    );
  }

  private async _bulkPutVoicemailView(array: Voicemail[]) {
    await this._voicemailViewDao.bulkPut(
      array.map((vm: Voicemail) => {
        return this._voicemailViewDao.toVoicemailView(vm);
      }),
    );
  }

  async doInTransaction(func: () => {}): Promise<void> {
    await this.getDb().ensureDBOpened();
    await this.getDb().getTransaction(
      'rw',
      [
        this.getDb().getCollection<VoicemailDao, number>(
          VoicemailDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<VoicemailViewDao, number>(
          VoicemailViewDao.COLLECTION_NAME,
        ),
      ],
      async () => {
        await func();
      },
    );
  }

  async queryVoicemails(
    limit: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    anchorId?: number,
  ): Promise<Voicemail[]> {
    const vmIds = await this._voicemailViewDao.queryVoicemails(
      limit,
      direction,
      anchorId,
    );
    const voicemails =
      (vmIds.length && (await this.batchGet(vmIds, true))) || [];
    return voicemails;
  }
}

export { VoicemailDao };
