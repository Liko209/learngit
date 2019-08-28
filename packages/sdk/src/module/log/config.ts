/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:07:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { LogControlConfig } from './types';

const DEFAULT_CONFIG: LogControlConfig = {
  uploadEnabled: true,
  memoryCountThreshold: 500,
  memorySizeThreshold: 1024 * 1024,
  combineSizeThreshold: 512 * 1024,
  uploadQueueLimit: 2,
  autoFlushTimeCycle: 60 * 1000,
  persistentLimit: 10 * 1024 * 1024,
  memoryCacheSizeThreshold: 10 * 1024 * 1024,
  zipLogAutoUpload: false,
};

class ConfigManager {
  private _config: LogControlConfig;

  constructor() {
    this._config = _.cloneDeep(DEFAULT_CONFIG);
  }

  getConfig(): LogControlConfig {
    return this._config;
  }

  setConfig(_config: LogControlConfig) {
    this._config = _config;
    return _config;
  }

  mergeConfig(partialConfig: Partial<LogControlConfig>) {
    const newConfig = _.mergeWith(
      {},
      this._config,
      partialConfig,
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return srcValue;
        }
      },
    );
    return this.setConfig(newConfig);
  }
}

const configManager = new ConfigManager();

export { configManager };
