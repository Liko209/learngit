import _ from 'lodash';
import { networkLogger } from '../log';
import { IResponse, IRequest } from './network';

function getRequestId(request: IRequest) {
  return request.id || _.get(request, 'parameters.request_id');
}

function simplifyRequest(request: IRequest) {
  return _.omit(request, 'handlerType');
}

function getHandlerTypeName(request: IRequest) {
  return _.get(request, 'handlerType.name');
}

export function doResponseLog(response: IResponse) {
  const request = response.request;
  const requestConsumeTime = Date.now() - request.startTime;

  const requestId = getRequestId(request);
  const path = _.get(request, 'path');
  networkLogger.info(`RESPONSE<KEY INFO>, [${path}] - [${requestId}]`, {
    path,
    requestConsumeTime,
    id: requestId,
    host: _.get(request, 'host'),
    handlerType: getHandlerTypeName(request),
    status_code: response.status,
  });

  networkLogger.info(`RESPONSE<FULL INFO>, [${requestId}]`, {
    request: simplifyRequest(request),
    response: _.omit(response, 'request'),
  });
}

export function doRequestLog(request: IRequest) {
  const now = Date.now();
  const inPendingQueueTime = now - request.startTime;
  request.startTime = now;
  const path = _.get(request, 'path');
  const requestId = getRequestId(request);
  networkLogger.info(
    `REQUEST<start request>,  [${path}] - [${requestId}]`,
    getRequestId(request),
    {
      id: requestId,
      inPendingQueueTime,
      request: simplifyRequest(request),
      handlerType: getHandlerTypeName(request),
    },
  );
}
