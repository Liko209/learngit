const INJECT_FLAG = '__jupiter__';
const INJECT_DATA = '__jupiter_data__';
const INJECT_HEADER = '__jupiter_header__';

interface IXhrInfo {
  request: {
    url: string;
    method: string;
    header?: object;
    data?: object;
    withCredentials: boolean;
  };
  response: {
    header?: object;
    status: number;
    statusText?: string;
    responseType: string;
    responseText?: string;
  };
}
interface ISocketInfo {
  url: string;
  protocol: string;
  type: 'send' | 'receive';
  content: string;
}

interface IGlipSocketInfo extends ISocketInfo {
  parse: {
    chanel: string;
    data: any;
  };
}

let onRequestCollected: (info: IXhrInfo) => void;
function parseHeaders(headers: string) {
  const parsed = {};
  let key;
  let val;
  let i;

  if (!headers) {
    return parsed;
  }

  headers.split('\n').forEach(line => {
    i = line.indexOf(':');
    key = line
      .substr(0, i)
      .trim()
      .toLowerCase();
    val = line.substr(i + 1).trim();

    if (key) {
      // if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
      //   return;
      // }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? `${parsed[key]},  ${val}` : val;
      }
    }
  });

  return parsed;
}

function collectXHR(callback: (request: IXhrInfo) => void) {
  onRequestCollected = callback;
  if (!XMLHttpRequest.prototype[INJECT_FLAG]) {
    const originOpen = XMLHttpRequest.prototype.open;
    const originSend = XMLHttpRequest.prototype.send;
    const originSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype[INJECT_FLAG] = true;
    XMLHttpRequest.prototype.setRequestHeader = function (
      name: string,
      value: string,
    ) {
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      request[INJECT_HEADER] = request[INJECT_HEADER] || {};
      request[INJECT_HEADER][name] = value;
      originSetRequestHeader.apply(this, arguments);
    };
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0];
      const url = arguments[1];
      // if (/sdk\.split\.io/.test(url)) return;
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      request[INJECT_FLAG] = true;
      const readyStateChangeListener = () => {
        request[INJECT_FLAG] = false;
        if (request.readyState === 4) {
          request.removeEventListener(
            'readystatechange',
            readyStateChangeListener,
          );
          const responseHeader =
            request.getAllResponseHeaders && request.getAllResponseHeaders();
          onRequestCollected &&
            onRequestCollected({
              request: {
                method,
                url,
                withCredentials: request.withCredentials,
                data: request[INJECT_DATA],
                header: request[INJECT_HEADER],
              },
              response: {
                status: request.status,
                statusText: request.statusText,
                responseType: request.responseType,
                responseText: request.responseText,
                header: parseHeaders(responseHeader),
              },
            });
        }
      };
      this.addEventListener('readystatechange', readyStateChangeListener);
      return originOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (data) {
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      if (request[INJECT_FLAG]) {
        request[INJECT_DATA] = data;
      }
      return originSend.apply(this, arguments);
    };
  }
}

function collectSocket(cb: (info: ISocketInfo) => void) {
  const originSocketSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function () {
    // tslint:disable-next-line:no-this-assignment
    const socket = this;
    cb &&
      cb({
        url: socket.url,
        protocol: socket.protocol,
        type: 'send',
        content: arguments[0],
      });
    if (!socket[INJECT_FLAG]) {
      socket[INJECT_FLAG] = true;
      const messageListener = function (event: MessageEvent) {
        cb &&
          cb({
            url: socket.url,
            protocol: socket.protocol,
            type: 'receive',
            content: event.data,
          });
      };
      const closeListener = () => {
        socket[INJECT_FLAG] = false;
        socket.removeEventListener('message', messageListener);
        socket.removeEventListener('close', closeListener);
      };
      socket.addEventListener('message', messageListener);
      socket.addEventListener('close', closeListener);
    }
    return originSocketSend.apply(this, arguments);
  };
}

const GLIP_SOCKET_CHANEL_PATTERN = /^42\[\"([^"]*)\",(\{.*\})\]$/;

function parseGlip(info: ISocketInfo) {
  if (GLIP_SOCKET_CHANEL_PATTERN.test(info.content)) {
    const [, chanel, data] = GLIP_SOCKET_CHANEL_PATTERN.exec(info.content)!;
    return {
      ...info,
      parse: {
        chanel,
        data: JSON.parse(data),
      },
    };
  }
  return info;
}

collectXHR(xhrInfo => {
  console.log('tcl: xhrInfo', xhrInfo);
});
collectSocket(socketInfo => {
  console.log('tcl: socketInfo', parseGlip(socketInfo));
});
