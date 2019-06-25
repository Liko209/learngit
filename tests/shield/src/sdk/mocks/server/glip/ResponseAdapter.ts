import _ from 'lodash';
import { INetworkRequestExecutorListener, IRequest } from '../types';
import { createResponse, isPromise } from '../utils';
import { Handler, IResponseAdapter } from './types';

export class ResponseAdapter implements IResponseAdapter {
  adapt = (handler: Handler) => {
    return (request: IRequest, cb: INetworkRequestExecutorListener) => {
      let handlerResp;
      try {
        handlerResp = handler(request);
      } catch (error) {
        console.log('TCL: ResponseAdapter -> adapt -> error', error);
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
            console.log('TCL: ResponseAdapter -> adapt -> error', error);

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
