import { networkLogger } from '../log';
import { IResponse } from '.';

export default function doLog(response: IResponse) {
  const request = response.request;
  delete response.request;

  networkLogger.info('request: ', request, 'response: ', response);
}
