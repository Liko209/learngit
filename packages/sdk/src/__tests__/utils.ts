import _ from 'lodash';

function to<T>(data): T {
  return Object.assign({} as T, data);
}

function toArrayOf<T>(arr: any[]): T[] {
  return arr.map(item => to<T>(item));
}

const extractIds = (arr: any[]) => _.map(arr, 'id');
const extractDisplayNames = (arr: any[]) => _.map(arr, 'display_name');

export { to, toArrayOf, extractIds, extractDisplayNames };
