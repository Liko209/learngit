/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:28
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from 'foundation/network/network';
import _ from 'lodash';
export function createResponse<T>(
  partial: Partial<IResponse<T>>,
): IResponse<T> {
  return _.merge(
    {
      status: 200,
      statusText: 'ok',
      headers: {},
      request: {},
    } as IResponse<T>,
    partial,
  );
}

export function isPromise(p: any): p is Promise<any> {
  return p && p.then;
}

export const String2Number = (v: string): number => {
  return Number(v);
};
