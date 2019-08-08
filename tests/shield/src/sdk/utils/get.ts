/*
 * @Author: Paynter Chen
 * @Date: 2019-08-03 21:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { UndefinedAble } from 'sdk/types';

function get<T extends object, G extends (v: T) => any>(
  v: UndefinedAble<T>,
  getter: G,
  defaultValue?: ReturnType<G>
): ReturnType<G> {
  const paths: any[] = [];
  const createProxy = (): object => {
    return new Proxy(
      {},
      {
        get: (obj, prop) => {
          if (typeof prop !== 'symbol' && prop !== 'inspect') {
            paths.push(prop);
            return createProxy();
          }
          return obj[prop];
        },
      },
    );
  };
  const proxy = createProxy();
  getter(proxy as any);
  const value = _.get(v, paths);
  return _.isUndefined(value) ? defaultValue : value;
}

export { get };
