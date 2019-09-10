/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-05 21:51:56
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { ConfigChangeHistory, ConfigKey, ConfigMove } from './types';
import { ServiceLoader, ServiceConfig } from '../../module/serviceLoader';
import { GlobalConfigService } from '../../module/config/service/GlobalConfigService';
import { UserConfigService } from '../../module/config/service/UserConfigService';
import { DBConfigService } from '../../module/config/service/DBConfigService';
import { CONFIG_TYPE, CONFIG_EVENT_TYPE } from '../../module/config/constants';
import { IConfigHistory } from './IConfigHistory';
import { IDBObserver } from 'sdk/dao/IDBObserver';
import { daoManager } from 'sdk/dao';
import { AccountGlobalConfig } from 'sdk/module/account/config';

// TODO FIJI-4002 should remove this after migration completed
/* eslint-disable */
class ConfigMigrator implements IDBObserver {
  private _dbConfigReady: boolean = false;
  private _userConfigReady: boolean = false;
  private _histories: IConfigHistory[] = [];

  constructor() {
    daoManager.observeDBInitialize(this);
  }

  onDBInitialized() {
    const userConfig = this._getConfig(CONFIG_TYPE.DB) as DBConfigService;
    userConfig.setConfigDao(daoManager.getDBKVDao());
    this._dbConfigReady = true;
    this.init();
  }

  observeUserDictionaryStatus() {
    const userDictionary: string = AccountGlobalConfig.getUserDictionary();
    if (userDictionary) {
      this.onUserDictionaryUpdate(userDictionary);
    } else {
      AccountGlobalConfig.observeUserDictionary(
        (eventType: CONFIG_EVENT_TYPE, userDictionary: string) => {
          if (eventType === CONFIG_EVENT_TYPE.UPDATE) {
            this.onUserDictionaryUpdate(userDictionary);
          }
        },
      );
    }
  }

  onUserDictionaryUpdate = (userDictionary: string) => {
    const userConfig = this._getConfig(CONFIG_TYPE.USER) as UserConfigService;
    userConfig.setUserId(userDictionary);
    this._userConfigReady = true;
    this.init();
  };

  async init() {
    if (!this._dbConfigReady || !this._userConfigReady) {
      return;
    }
    this._histories.forEach((history: IConfigHistory) => {
      const detail = history.getHistoryDetail();
      if (detail) {
        this._doDataMigration(detail);
      }
    });
    this._histories = [];
  }

  addHistory(history: IConfigHistory) {
    const detail = history.getHistoryDetail();
    if (!detail) {
      return;
    }
    if (this._dbConfigReady && this._userConfigReady) {
      this._doDataMigration(detail);
    } else {
      this._histories.push(history);
    }
  }

  private async _doDataMigration(history: ConfigChangeHistory) {
    if (!history || history.version === undefined || !history.moduleName) {
      return;
    }
    try {
      const oldVersion = this._getVersion(history.moduleName) || 0;
      if (oldVersion === history.version) {
        return;
      }
      let newVersion = oldVersion + 1;
      while (newVersion <= history.version) {
        const change = history.changes[newVersion];
        if (change) {
          if (change.delete) {
            await Promise.all(
              change.delete.map(async (key: ConfigKey) => {
                await this._getConfig(key.type).remove(
                  history.moduleName,
                  key.value,
                );
              }),
            );
          }
          if (change.move) {
            await Promise.all(
              change.move.map(async (move: ConfigMove) => {
                const value = await this._getConfig(move.from.type).get(
                  history.moduleName,
                  move.from.value,
                );
                if (value) {
                  await this._getConfig(move.to.type).put(
                    history.moduleName,
                    move.to.value,
                    value,
                  );
                  await this._getConfig(move.from.type).remove(
                    history.moduleName,
                    move.from.value,
                  );
                }
              }),
            );
          }
        }
        this._setVersion(history.moduleName, newVersion);
        ++newVersion;
      }
    } catch (err) {
      mainLogger.error('doDataMigration error:', err);
    }
  }

  private _getConfig(type: CONFIG_TYPE) {
    if (type === CONFIG_TYPE.DB) {
      return ServiceLoader.getInstance<DBConfigService>(
        ServiceConfig.DB_CONFIG_SERVICE,
      );
    }
    if (type === CONFIG_TYPE.USER) {
      return ServiceLoader.getInstance<UserConfigService>(
        ServiceConfig.USER_CONFIG_SERVICE,
      );
    }
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    );
  }

  private _getVersion(moduleName: string) {
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    ).getVersion(moduleName);
  }

  private _setVersion(moduleName: string, version: number) {
    return ServiceLoader.getInstance<GlobalConfigService>(
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
    ).setVersion(moduleName, version);
  }
}

const configMigrator = new ConfigMigrator();

export { configMigrator };
