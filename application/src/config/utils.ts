/*
 * @Author: Paynter Chen
 * @Date: 2019-04-06 10:35:13
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { EnvConfig } from './types';
import { parseConfigMap } from './requireUtil';

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
  return Object.keys(configMap)
    .map(key => ({
      key,
      config: _.merge(configMap[key]['default'], configMap[key][env] || {}),
    }))
    .reduce((preValue, { key, config }) => {
      return { ...preValue, ...{ [key]: config } };
    },      {});
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

export { parseConfigMap, loadFileConfigs, getEnvArray, get, set };
