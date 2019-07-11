/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketIO } from 'mock-socket';

function create(url, protocol) {
  // url = url.replace()
  console.warn('create socket.io instance: ', url);
  const socket = SocketIO(url, protocol);
  socket.__mock__ = true;
  socket.connect = () => {
    // console.warn('socket.connect -> ', url);
    socket.readyState = WebSocket.OPEN;
  };
  socket.removeAllListeners = () => {};
  const rawClose = socket.close;
  socket.close = function () {
    // console.warn('socket.close -> ', url);
    return rawClose.call(socket, ...arguments);
  };
  socket.destroy = () => {
    socket.close();
  };
  return socket;
}
export default create;
