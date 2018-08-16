// Replace ${deployHost} with real deployHost
import merge from 'lodash/merge';

const deployHost = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ''
  }`;

function loadFileConfigs(env: string) {
  const config = {};
  const requireContext = require.context('./', true, /.json$/);
  const keys = requireContext.keys();
  const modules = keys.map(requireContext);
  keys
    .map((path: string) =>
      path
        .split('.')[1]
        .split('/')
        .slice(1),
    )
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
    },      config);

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
  private static instance: Config;
  private config = {};

  private constructor() {
    this.config = loadFileConfigs('Chris_sandbox');
  }

  public static get Instance() {
    this.instance = this.instance || (this.instance = new this());
    return this.instance;
  }

  get(property: string) {
    return get(this.config, property);
  }

  set(property: string, value: any) {
    set(this.config, property, value);
  }

  has(property: string) {
    return get(this.config, property) !== undefined;
  }
}

export default Config.Instance;
