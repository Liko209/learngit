import { UploadConsumerConfig } from './types';
import _ from 'lodash';

const DEFAULT_CONFIG: UploadConsumerConfig = {
  enabled: false,
  memoryCountThreshold: 100,
  memorySizeThreshold: 1024 * 1024,
  combineSizeThreshold: 50 * 1024,
  uploadQueueLimit: 4,
  autoFlushTimeCycle: 30 * 1000,
  persistanceLimit: 10 * 1024 * 1024,
};

class ConfigManager {
  private _config: UploadConsumerConfig;

  constructor() {
    this._config = _.cloneDeep(DEFAULT_CONFIG);
  }

  getConfig(): UploadConsumerConfig {
    return this._config;
  }

  setConfig(_config: UploadConsumerConfig) {
    this._config = _config;
    return _config;
  }

  mergeConfig(partialConfig: Partial<UploadConsumerConfig>) {
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
