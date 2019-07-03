import _ from 'lodash';
import { INetworkRequestExecutorListener, IRequest } from '../types';
import { createResponse, isPromise } from '../utils';
import { Handler, IResponseAdapter } from './types';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('ResponseAdapter', true);

export class ResponseAdapter implements IResponseAdapter {
  adapt = (handler: Handler) => {
    return (
      request: IRequest,
      cb: INetworkRequestExecutorListener,
      routeParams: object,
    ) => {
      let handlerResp;
      try {
        handlerResp = handler(request, routeParams);
      } catch (error) {
        debug('handle error: ', error);
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
          .catch(error => {
            debug('handle error: ', error);
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
}
