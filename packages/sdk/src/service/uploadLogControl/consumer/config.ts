/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:07:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { LogConsumerConfig } from './types';

const DEFAULT_CONFIG: LogConsumerConfig = {
  uploadEnabled: false,
  memoryCountThreshold: 100,
  memorySizeThreshold: 1024 * 1024,
  combineSizeThreshold: 50 * 1024,
  uploadQueueLimit: 4,
  autoFlushTimeCycle: 30 * 1000,
  persistentLimit: 10 * 1024 * 1024,
  memoryCacheSizeThreshold: 10 * 1024 * 1024,
};

class ConfigManager {
  private _config: LogConsumerConfig;

  constructor() {
    this._config = _.cloneDeep(DEFAULT_CONFIG);
  }

  getConfig(): LogConsumerConfig {
    return this._config;
  }

  setConfig(_config: LogConsumerConfig) {
    this._config = _config;
    return _config;
  }

  mergeConfig(partialConfig: Partial<LogConsumerConfig>) {
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
