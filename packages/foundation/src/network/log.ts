import { networkLogger } from '../log';
import { IResponse } from '.';
import { IRequest } from './network';

export function doResponseLog(response: IResponse) {
  const request = response.request;
  delete response.request;

  networkLogger.info(
    'receiveResponse: ',
    '==request==: ',
    request,
    '\n==response==: ',
    response,
  );
}

export function doRequestLog(request: IRequest) {
  networkLogger.info('startRequest: ', request);
}
