import { networkLogger } from '../log';
import { IResponse } from '.';

export default function doLog(response: IResponse) {
  const request = response.request;
  delete response.request;

  const log = `
    request:
      ${JSON.stringify(request)}
    response:
      ${JSON.stringify(response)}
  `;
  networkLogger.info(log);
}
