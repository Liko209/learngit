/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-20 10:48:13
 */

import { SOCKET, DOCUMENT, WINDOW } from '../service/eventKey';
import notificationCenter from './notificationCenter';

window.addEventListener(
  'online',
  () => {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'online' });
    notificationCenter.emit(WINDOW.ONLINE, { onLine: true });
  },
);

window.addEventListener(
  'offline',
  () => {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
    notificationCenter.emit(WINDOW.ONLINE, { onLine: false });
  },
);

window.addEventListener('load', () => {
  if (!navigator.onLine) {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
  }
});

window.addEventListener('focus', () => {
  if (navigator.onLine) {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'focus' });
    notificationCenter.emit(WINDOW.FOCUS);
  }
});

window.addEventListener('blur', () => {
  notificationCenter.emit(WINDOW.BLUR);
});

document.addEventListener('visibilitychange', () => {
  notificationCenter.emit(DOCUMENT.VISIBILITYCHANGE, {
    isHidden: document.visibilityState === 'hidden',
  });
});
