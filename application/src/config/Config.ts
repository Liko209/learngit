/*
 * @Author: Paynter Chen
 * @Date: 2019-04-06 13:37:06
 * Copyright © RingCentral. All rights reserved.
 */

// Replace ${deployHost} with real deployHost
import _ from 'lodash';
import { AppEnvSetting } from 'sdk/module/env';
import { DirectoryConfigMap } from './types';
import { loadFileConfigs, getEnvArray, get, set } from './utils';

const { protocol, hostname, port } = window.location;
const deployHost = `${protocol}//${hostname}${port && `:${port}`}`;

function buildConfig(conf: any, variables: any) {
  let str = JSON.stringify(conf);

  // Replace variables
  Object.keys(variables).forEach((key: string) => {
    const re = new RegExp(`\\$\\{${key}\\}`, 'g');
    str = str.replace(re, variables[key]);
  });

  return JSON.parse(str);
}

class Config {
  private _config: DirectoryConfigMap;
  private _env = '';

  constructor() {
    this.loadEnvConfig();
  }

  loadEnvConfig() {
    const value = AppEnvSetting.getEnv() || this.defaultEnv();
    this._env = value;
    this._config = buildConfig(loadFileConfigs(value), { deployHost });
  }

  public isProductionBuild() {
    return process.env.JUPITER_ENV === 'production';
  }

  public isPublicBuild() {
    return process.env.JUPITER_ENV === 'public';
  }

  public defaultEnv() {
    const productionEnv = this.isProductionBuild() || this.isPublicBuild();
    return productionEnv ? 'production' : 'GLP-DEV-XMN';
  }

  getEnv() {
    return this._env || this.defaultEnv();
  }

  getAllEnv() {
    return getEnvArray().filter((env: string) => {
      return this.isProductionBuild() || env !== 'production';
    });
  }

  get<T1 extends DirectoryConfigMap, K1 extends keyof T1>(k1: K1): T1[K1];
  get<
    T1 extends DirectoryConfigMap,
    K1 extends keyof T1,
    T2 extends T1[K1],
    K2 extends keyof T2
  >(k1: K1, k2: K2): T2[K2];
  get<
    T1 extends DirectoryConfigMap,
    K1 extends keyof T1,
    T2 extends T1[K1],
    K2 extends keyof T2,
    T3 extends T2[K2],
    K3 extends keyof T3
  >(k1: K1, k2: K2, k3: K3): T3[K3];

  get(...keys: string[]) {
    return get(this._config, keys);
  }

  set(property: string, value: any) {
    set(this._config, property, value);
  }

  has(property: string) {
    return get(this._config, property) !== undefined;
  }
}

export { Config };
