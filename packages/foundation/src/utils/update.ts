/*
 * update util similar as react-addons-update
 * remove $merge, support deepMerge by default
 * commands: $set, $apply, $delete, $push, $splice
 * @Author: Paynter Chen
 * @Date: 2019-08-03 13:10:11
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

type SetCommand<V> = {
  $set: V;
};

type ApplyCommand<V> = {
  $apply: (v: V) => V;
};

type DeleteCommand<V> = {
  $delete: keyof V;
};

type PushCommand<V> = {
  $push: V;
};

type SpliceCommand<V> = {
  $splice: [number, number, V];
};

type Command<V> =
  | SetCommand<V>
  | ApplyCommand<V>
  | DeleteCommand<V>
  | SpliceCommand<V>
  | PushCommand<V>;

type UpdateSpec<T> =
  | { [P in keyof T]?: UpdateSpec<T[P]> | Command<T[P]> }
  | Command<T>;

function set<V, S extends SetCommand<V>['$set']>(v: V, spec: S) {
  return spec;
}

function apply<V, S extends ApplyCommand<V>['$apply']>(v: V, spec: S) {
  return spec(v);
}

function push<V extends any[], S extends PushCommand<V>['$push']>(
  v: V,
  spec: S,
) {
  if (!Array.isArray(v)) {
    return ([] as any[]).concat(spec);
  }
  return v.concat(spec);
}

function _delete<
  V extends object | any[],
  S extends DeleteCommand<V>['$delete']
>(v: V, spec: S) {
  if (_.isArray(v)) {
    return [...v.slice(0, spec as number), ...v.slice((spec as number) + 1)];
  }
  const copy = _.clone(v);
  delete copy[spec];
  return copy;
}

function splice<V extends any[], K extends SpliceCommand<V>['$splice']>(
  v: V,
  spec: K,
) {
  const [startIndex, deleteCount, insertValue] = spec;
  return [
    ...v.slice(0, startIndex),
    ...insertValue,
    ...v.slice(startIndex + deleteCount),
  ];
}

function update<
  T extends object | any[],
  A = T extends Array<infer A> ? A : any
>(value: T, spec?: UpdateSpec<T>): T {
  if (_.isUndefined(spec) || _.isUndefined(value)) return value;
  if (Object.prototype.hasOwnProperty.call(spec, '$set')) {
    return set(value, (spec as SetCommand<T>)['$set']);
  }
  if (Object.prototype.hasOwnProperty.call(spec, '$apply')) {
    return apply(value, (spec as ApplyCommand<T>)['$apply']);
  }
  if (Object.prototype.hasOwnProperty.call(spec, '$delete')) {
    return _delete(value, (spec as DeleteCommand<T>)['$delete']) as T;
  }
  if (Object.prototype.hasOwnProperty.call(spec, '$splice')) {
    return splice(value as A[], (spec as SpliceCommand<A[]>)['$splice']) as T;
  }
  if (Object.prototype.hasOwnProperty.call(spec, '$push')) {
    return push(value as A[], (spec as PushCommand<A[]>)['$push']) as T;
  }
  const copy = _.clone(value);
  for (const key in spec) {
    if (Object.prototype.hasOwnProperty.call(spec, key)) {
      if (_.isObject(spec[key]) || _.isArray(spec[key])) {
        copy[key] = update(copy[key] || spec[key], spec[key]);
      } else if (!_.isUndefined(spec[key])) {
        copy[key] = spec[key];
      }
    }
  }
  return copy;
}

export { update, UpdateSpec };
