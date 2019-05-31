import { networkLogger } from '../log';
import { IResponse } from '.';
import { IRequest } from './network';
import _ from 'lodash';

export function doResponseLog(response: IResponse) {
  const request = response.request;
  const consumeTime = request.startTime ? Date.now() - request.startTime : -1;

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
  const consumeTime = request.startTime ? now - request.startTime : -1;
  request.startTime = now;
  networkLogger.info(
    'inPendingQueueTime:',
    consumeTime,
    'startRequest: ',
    request,
  );
}
