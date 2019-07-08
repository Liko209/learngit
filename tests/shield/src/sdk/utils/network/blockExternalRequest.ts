import https from 'https';
import http, { RequestOptions, IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import { createDebug } from 'sdk/__tests__/utils';
import _ from 'lodash';
const debug = createDebug('BlockExternalRequest', false);
class SimpleBlockRequest extends EventEmitter {
  emit(event: any, ...args: any) {
    debug('emit -> emit', event);

    return super.emit(event, ...args);
  }
  end(data?: any) {
    debug('-> end', data);
    super.emit('end', data);
  }
  abort() {
    debug('-> abort');
    super.emit('abort');
  }
  destroy() {
    debug('-> destroy');
    super.emit('destroy');
  }
}

function wrapRequest(transport: typeof http | typeof https) {
  const rawRequest = transport.request;
  transport.request = function wrap() {
    let options: RequestOptions;
    let callback: (res: IncomingMessage) => void = () => {};

    if (arguments.length === 1) {
      options = arguments[0];
    } else if (arguments.length === 2) {
      options = arguments[0];
      callback = arguments[1];
    } else if (arguments.length === 3) {
      options = arguments[1];
      callback = arguments[2];
    } else {
      debug('options?: ', arguments);
      return rawRequest.call(transport, arguments);
    }
    debug('block request: ', _.pick(options, ['uri', 'host', 'protocol']));
    const req = new SimpleBlockRequest();
    const socket = new EventEmitter();
    const response = new IncomingMessage(socket as any);
    req.on('data', (chunk: any) => {
      debug('data chunk', chunk);
    });
    req.on('finish', () => {
      debug('finish', req);
      response.emit('end');
    });
    req.on('end', () => {
      response.emit('data', 'eeeeee');
      response.emit('end');
    });
    req.on('upgrade', () => {});
    response.statusCode = 500;
    response.statusMessage = 'Blocked for test';
    response.headers = {};
    callback && callback(response);
    return req;
  };
}

export function blockExternalRequest() {
  wrapRequest(http);
  wrapRequest(https);
}
