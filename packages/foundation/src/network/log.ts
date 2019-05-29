import { networkLogger } from '../log';
import { IResponse } from '.';
import { IRequest } from './network';
import _ from 'lodash';

export function doResponseLog(response: IResponse) {
  const request = response.request;
  networkLogger.info(
    'receiveResponse: ',
    '==request==: ',
    request,
    '\n==response==: ',
    _.omit(response, 'request'),
  );
}

export function doRequestLog(request: IRequest) {
  networkLogger.info('startRequest: ', request);
}
