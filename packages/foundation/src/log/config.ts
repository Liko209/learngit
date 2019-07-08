import mergeWith from 'lodash/mergeWith';
import { LogConfig } from './types';
import { LOG_LEVEL } from './constants';

const defaultConfig: LogConfig = {
  level: LOG_LEVEL.ALL,
  enabled: true,
  filter: () => true,
  browser: {
    enabled: true,
  },
  collector: {
    enabled: true,
  },
  decorators: [],
  truncateThreshold: 4000,
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
