// Replace ${deployHost} with real deployHost
import _ from 'lodash';
import { AppEnvSetting } from 'sdk/module/env';
import { DBConfig, ApiConfig } from 'sdk/types';

const { protocol, hostname, port } = window.location;
const deployHost = `${protocol}//${hostname}${port && `:${port}`}`;
type DirectoryConfigMap = {
  api: ApiConfig;
  db: DBConfig;
};

type Directories = keyof DirectoryConfigMap;
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

type EnvConfig<T> = {
  default: T;
} & {
  [env: string]: DeepPartial<T>;
};

type RawConfig = { [key in Directories]: EnvConfig<DirectoryConfigMap[key]> };

function get(object: object, property: string | string[]): any {
  const elems = Array.isArray(property) ? property : property.split('.');
  const name = elems[0];
  const value = object[name];
  if (elems.length <= 1) {
    return value;
  }
  if (value === null || typeof value !== 'object') {
    return undefined;
  }
  return get(value, elems.slice(1));
}

function set(object: object, property: string | string[], value: any) {
  const elems = Array.isArray(property) ? property : property.split('.');
  const name = elems[0];
  if (elems.length <= 1) {
    object[name] = value;
    return;
  }
  let obj = object[name];
  if (typeof obj !== 'object') {
    object[name] = {};
    obj = object[name];
  }
  set(obj, elems.slice(1), value);
}

function parseConfigMap(): RawConfig {
  const requireContext = require.context('./', true, /^(?!.*\/index).*\.ts$/);
  const keys = requireContext.keys();
  const rawConfig = {} as RawConfig;
  return keys.reduce((config, envPath) => {
    const [, keyName, envFileName] = envPath.split('/');
    const [envName] = envFileName.split('.');
    config[keyName] = config[keyName] || {};
    config[keyName][envName] = requireContext(envPath)['default'];
    return config;
  },                 rawConfig);
}

function getEnvArray() {
  const configMap = parseConfigMap();
  return Object.keys(configMap)
    .map(key => configMap[key])
    .map((envConfig: EnvConfig<any>) =>
      Object.keys(envConfig).filter(env => env !== 'default'),
    )
    .reduce((pre, envArray) => {
      return _.union(pre, envArray);
    },      []);
}

function loadFileConfigs(env: string) {
  const configMap = parseConfigMap();
  const configs = Object.keys(configMap)
    .map(key => ({
      key,
      config: _.merge(configMap[key]['default'], configMap[key][env] || {}),
    }))
    .reduce((preValue, { key, config }) => {
      return { ...preValue, ...{ [key]: config } };
    },      {});
  return buildConfig(configs, { deployHost });
}

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
  private static _instance: Config;
  private _config: DirectoryConfigMap;
  private _env = '';

  private constructor() {
    this.loadEnvConfig();
  }

  public static get Instance() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance;
  }

  loadEnvConfig() {
    const value = AppEnvSetting.getEnv() || this.defaultEnv();
    this._env = value;
    this._config = loadFileConfigs(value);
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

export default Config.Instance;
