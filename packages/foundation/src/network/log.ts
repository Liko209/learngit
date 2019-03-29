import { networkLogger } from '../log';
import { IResponse } from '.';
import { IRequest } from './network';

export function doResponseLog(response: IResponse) {
  const request = response.request;
  delete response.request;

  networkLogger.info(
    'responseTime: ',
    Date.now(),
    'request: ',
    request,
    'response: ',
    response,
  );
}

export function doRequestLog(request: IRequest) {
  networkLogger.info('requestTime: ', Date.now(), 'request: ', request);
}
