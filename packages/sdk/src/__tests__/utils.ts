import _ from 'lodash';
import { FunctionPropertyNames } from '../types';

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

export { to, toArrayOf, extractIds, extractDisplayNames, spyOnTarget };
