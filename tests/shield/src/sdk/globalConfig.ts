/*
 * @Author: Paynter Chen
 * @Date: 2019-07-11 22:32:50
 * Copyright © RingCentral. All rights reserved.
 */

type ItConfigMap = {
  mode: 'glip' | 'rc';
  userId: string;
};

class ItGlobalConfig {
  private _configMap: ItConfigMap = {
    mode: 'glip',
    userId: '',
  };

  set<K extends keyof ItConfigMap>(key: K, value: ItConfigMap[K]) {
    this._configMap[key] = value;
  }

  get<K extends keyof ItConfigMap>(key: K) {
    return this._configMap[key];
  }
}

const globalConfig = new ItGlobalConfig();
export { globalConfig };
