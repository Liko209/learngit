import _ from 'lodash';
import { networkLogger } from '../log';
import { IResponse, IRequest } from './network';

export function doResponseLog(response: IResponse) {
  const request = response.request;
  const consumeTime = Date.now() - request.startTime;

  networkLogger.info(
    'requestConsumeTime:',
    consumeTime,
    ' <<request>>: ',
    request,
    '     <<response>>:    ',
    _.omit(response, 'request'),
  );
}

export function doRequestLog(request: IRequest) {
  const now = Date.now();
  const consumeTime = now - request.startTime;
  request.startTime = now;
  networkLogger.info(
    'inPendingQueueTime:',
    consumeTime,
    'startRequest: ',
    request,
  );
}
