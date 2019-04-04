import { LogEntity, LogConfig } from './types';
import { LOG_LEVEL } from './constants';
import mergeWith from 'lodash/mergeWith';

const defaultConfig: LogConfig = {
  level: LOG_LEVEL.ALL,
  enabled: true,
  filter: (logEntity: LogEntity) => true,
  browser: {
    enabled: true,
  },
  consumer: {
    enabled: true,
  },
  decorators: [],
  truncateThreshold: 1024 * 1024,
};

class ConfigManager {
  private _config: LogConfig;

  constructor() {
    this._config = defaultConfig;
  }

  getConfig(): LogConfig {
    return this._config;
  }

  setConfig(_config: LogConfig) {
    this._config = _config;
    return _config;
  }

  mergeConfig(partialConfig: Partial<LogConfig>) {
    const newConfig = mergeWith(
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
