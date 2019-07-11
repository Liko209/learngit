import _ from 'lodash';
import { FunctionPropertyNames } from '../types';
import _debug from 'debug';
const debug = _debug('UT_LOG');
const debugEnabled = !!process.env.DEBUG_LOG;
debug['useColors'] = true;
debug.enabled = debugEnabled;
_debug.enable('-UT_LOG');
function createDebug(tag: string, enabled?: boolean) {
  const newDebug = _debug(tag);
  newDebug['useColors'] = true;
  if (enabled !== undefined) {
    newDebug.enabled = enabled;
  } else {
    newDebug.enabled = debugEnabled;
  }
  return newDebug;
}

function to<T>(data): T {
  return Object.assign({} as T, data);
}

function toArrayOf<T>(arr: any[]): T[] {
  return arr.map(item => to<T>(item));
}

const extractIds = (arr: any[]) => _.map(arr, 'id');
const extractDisplayNames = (arr: any[]) => _.map(arr, 'display_name');
const spyOnTarget = <T>(target: T) => {
  for (const key in target) {
    if (Object.prototype.toString.call(target[key]) === '[object Function]') {
      jest.spyOn(target, (key as any) as FunctionPropertyNames<T>);
    }
  }
  return target;
};

export {
  to,
  toArrayOf,
  extractIds,
  extractDisplayNames,
  spyOnTarget,
  debug,
  createDebug,
};
