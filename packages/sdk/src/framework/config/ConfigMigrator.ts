/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-05 21:51:56
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import { ConfigChangeHistory, ConfigKey, ConfigMove } from './types';
import { ServiceLoader, ServiceConfig } from '../../module/serviceLoader';
import { GlobalConfigService } from '../../module/config/service/GlobalConfigService';
import { UserConfigService } from '../../module/config/service/UserConfigService';
import { DBConfigService } from '../../module/config/service/DBConfigService';
import { CONFIG_TYPE } from '../../module/config/constants';
import { IConfigHistory } from './IConfigHistory';

// TODO FIJI-4002 should remove this after migration completed

class ConfigMigrator {
  private _isReady: boolean;
  private _histories: IConfigHistory[];

  constructor() {
    this._isReady = false;
    this._histories = [];
  }

  async init() {
    this._isReady = true;
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
    if (this._isReady) {
      this._doDataMigration(detail);
    } else {
      this._histories.push(history);
    }
  }

  private async _doDataMigration(history: ConfigChangeHistory) {
    if (!history || !history.version || !history.moduleName) {
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
