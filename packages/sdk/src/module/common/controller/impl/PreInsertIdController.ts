/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 10:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { IPreInsertIdController } from '../interface/IPreInsertIdController';
import { mainLogger } from 'foundation';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { UserConfigService } from '../../../../module/config';

const PREINSERT_KEY_ID = 'PREINSERT_KEY_ID';

const TAG = 'PreInsertIdController';
class PreInsertIdController implements IPreInsertIdController {
  private _versions: number[];
  private _modelName: string;
  constructor(modelName: string) {
    this._modelName = modelName;
    this._initVersions();
  }

  private _initVersions() {
    const configService: UserConfigService = UserConfigService.getInstance();
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    this._versions = configService.get(this._modelName, PREINSERT_KEY_ID) || [];
  }

  private _syncDataDB() {
    const configService: UserConfigService = UserConfigService.getInstance();
    configService.setUserId(AccountGlobalConfig.getUserDictionary());
    configService.put(this._modelName, PREINSERT_KEY_ID, this._versions);
  }

  isInPreInsert(version: number): boolean {
    return !this._versions || !this._versions.length
      ? false
      : this._versions.includes(version);
  }

  async insert(version: number): Promise<void> {
    if (this.isInPreInsert(version)) {
      mainLogger.info(TAG, 'insert() version already in preinsert array');
    }
    this._versions.push(version);
    this._syncDataDB();
  }

  async delete(version: number): Promise<void> {
    const index = this._versions.indexOf(version);
    if (index !== -1) {
      this._versions.splice(index, 1);
      this._syncDataDB();
    }
  }

  async bulkDelete(versions: number[]): Promise<void> {
    if (!versions || !versions.length) {
      return;
    }
    this._versions = this._versions.filter(
      (version: number) => !versions.includes(version),
    );
    this._syncDataDB();
  }

  getAll(): number[] {
    return this._versions;
  }
}

export default PreInsertIdController;
