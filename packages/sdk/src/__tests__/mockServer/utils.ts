import { IResponse } from 'foundation/src/network/network';
import _ from 'lodash';
export function createResponse<T>(
  partial: Partial<IResponse<T>>,
): IResponse<T> {
  return _.defaults(
    {
      status: 200,
      statusText: 'ok',
      headers: {},
      request: {},
    } as IResponse<T>,
    partial,
  );
}
