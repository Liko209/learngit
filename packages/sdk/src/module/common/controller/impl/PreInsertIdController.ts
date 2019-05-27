/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 10:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { IPreInsertIdController } from '../interface/IPreInsertIdController';
import { AccountGlobalConfig } from '../../../../module/account/config';
import { UserConfigService } from '../../../../module/config';
import { ServiceConfig, ServiceLoader } from '../../../serviceLoader';

const PREINSERT_KEY_ID = 'PREINSERT_KEY_ID';

class PreInsertIdController implements IPreInsertIdController {
  private _preInsertIds: Set<string>;
  private _modelName: string;
  constructor(modelName: string) {
    this._modelName = modelName;
    this._preInsertIds = new Set();
    this._initPreInsertIds();
  }

  private _initPreInsertIds() {
    const configService = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    );
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    const ids = configService.get(this._modelName, PREINSERT_KEY_ID) || [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (typeof id === 'number') {
        this._preInsertIds.add(id.toString());
      } else {
        this._preInsertIds.add(id);
      }
    }
  }

  private _syncDataDB() {
    const configService = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    );
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    configService.put(this._modelName, PREINSERT_KEY_ID, [
      ...this._preInsertIds,
    ]);
  }

  isInPreInsert(preInsertId: string): boolean {
    return this._preInsertIds.size
      ? this._preInsertIds.has(preInsertId)
      : false;
  }

  async insert(preInsertId: string): Promise<void> {
    this._preInsertIds.add(preInsertId);
    this._syncDataDB();
  }

  async delete(preInsertId: string): Promise<void> {
    if (this._preInsertIds.has(preInsertId)) {
      this._preInsertIds.delete(preInsertId);
      this._syncDataDB();
    }
  }

  async bulkDelete(preInsertIds: string[]): Promise<void> {
    if (!preInsertIds || !preInsertIds.length) {
      return;
    }
    preInsertIds.forEach(
      (id: string) =>
        this._preInsertIds.has(id) && this._preInsertIds.delete(id),
    );
    this._syncDataDB();
  }

  getAll(): string[] {
    return [...this._preInsertIds];
  }
}

export default PreInsertIdController;
