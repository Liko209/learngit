/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:45
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { createDebug } from 'sdk/__tests__/utils';

import {
  RequestHandler,
  IJRequest,
  INetworkRequestExecutorListener,
  IResponseAdapter,
} from 'shield/sdk/types';
import { createResponse, isPromise } from './utils';

const error = createDebug('ResponseAdapter', true);

export class ResponseAdapter implements IResponseAdapter {
  adapt = (handler: RequestHandler) => (
    request: IJRequest,
    cb: INetworkRequestExecutorListener,
  ) => {
    let handlerResp;
    try {
      handlerResp = handler(request);
    } catch (e) {
      error('handle error: ', e);
      cb.onFailure(
        createResponse({
          request,
          data: { error },
          status: 500,
          statusText: 'Mock server internal error',
          headers: {},
        }),
      );
      return;
    }
    if (isPromise(handlerResp)) {
      handlerResp
        .then(response => {
          cb.onSuccess(response);
        })
        .catch(e => {
          error('handle error: ', e);
          cb.onFailure(
            createResponse({
              request,
              data: { error },
              status: 500,
              statusText: 'Mock server internal error',
              headers: {},
            }),
          );
        });
    } else {
      cb.onSuccess(handlerResp);
    }
  };
}
