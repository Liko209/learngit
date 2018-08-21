// Replace ${deployHost} with real deployHost
import merge from 'lodash/merge';
import { service } from 'sdk';

const { ConfigService } = service;

const deployHost = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ''
  }`;

function parseConfigFiles() {
  const requireContext = require.context('./', true, /.json$/);
  const keys = requireContext.keys();
  const modules = keys.map(requireContext);

  return {
    modules,
    keys: keys.map(clean),
  };

  function clean(path: string) {
    return path.split('.')[1].split('/').slice(1);
  }
}

function loadFileConfigs(env: string) {
  const { keys, modules } = parseConfigFiles();
  const config = keys
    .reduce((config, names: string[], currentIndex) => {
      const value = modules[currentIndex];
      const name = names[0];
      if (names.length === 2) {
        if (['default', env].includes(names[1])) {
          config[name] =
            names[1] === 'default'
              ? merge(value, config[name])
              : merge(config[name], value);
        }
      } else {
        config[name] = value;
      }
      return config;
    },      {});

  return buildConfig(config, { deployHost });
}

function buildConfig(conf: any, variables: any) {
  let str = JSON.stringify(conf);

  // Replace variables
  Object.keys(variables).forEach((key: string) => {
    const re = new RegExp('\\$\\{' + key + '\\}', 'g');
    str = str.replace(re, variables[key]);
  });

  return JSON.parse(str);
}

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

class Config {
  private static _instance: Config;
  private _config = {};
  private _env = '';

  private constructor() {
    const configService: service.ConfigService = ConfigService.getInstance();
    const value = configService.getEnv() || 'XMN-UP';
    this._env = value;
    this._config = loadFileConfigs(value);
  }

  public static get Instance() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance;
  }

  getEnv() {
    return this._env;
  }

  getAllEnv() {
    return parseConfigFiles().keys
      .filter(arr => arr[0] === 'api')
      .map(arr => arr[1]);
  }

  get(property: string) {
    return get(this._config, property);
  }

  set(property: string, value: any) {
    set(this._config, property, value);
  }

  has(property: string) {
    return get(this._config, property) !== undefined;
  }
}

export default Config.Instance;
