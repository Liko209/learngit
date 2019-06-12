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
  private _preInsertIds = {};
  private _modelName: string;
  constructor(modelName: string) {
    this._modelName = modelName;
    this._initPreInsertIds();
  }

  private _initPreInsertIds() {
    const configService = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    );
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    const preInsertKeysIds = configService.get(
      this._modelName,
      PREINSERT_KEY_ID,
    );
    if (preInsertKeysIds) {
      this._preInsertIds = JSON.parse(preInsertKeysIds);
    }
  }

  private _syncDataDB() {
    const configService = ServiceLoader.getInstance<UserConfigService>(
      ServiceConfig.USER_CONFIG_SERVICE,
    );
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    configService.put(
      this._modelName,
      PREINSERT_KEY_ID,
      JSON.stringify(this._preInsertIds),
    );
  }

  isInPreInsert(uniqueId: string): boolean {
    return this._preInsertIds.hasOwnProperty(uniqueId);
  }

  async insert(uniqueId: string, preInsertId: number): Promise<void> {
    this._preInsertIds[uniqueId] = preInsertId;
    this._syncDataDB();
  }

  async delete(uniqueId: string): Promise<void> {
    delete this._preInsertIds[uniqueId];
    this._syncDataDB();
  }

  async bulkDelete(uniqueIds: string[]): Promise<void> {
    uniqueIds.forEach((uniqueId: string) => {
      delete this._preInsertIds[uniqueId];
    });
    this._syncDataDB();
  }

  getAll(): { uniqueIds: string[]; ids: number[] } {
    return {
      uniqueIds: Object.keys(this._preInsertIds),
      ids: Object.values(this._preInsertIds),
    };
  }
}

export default PreInsertIdController;
