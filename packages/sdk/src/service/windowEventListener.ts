/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-20 10:48:13
 */

import { SOCKET, DOCUMENT } from '../service/eventKey';
import notificationCenter from './notificationCenter';

window.addEventListener('online', () => notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'online' }));
window.addEventListener('offline', () => notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' }));
window.addEventListener('load', () => {
  if (!navigator.onLine) {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
  }
});

window.addEventListener('focus', () => {
  if (navigator.onLine) {
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'focus' });
  }
});

document.addEventListener('visibilitychange', () => {
  notificationCenter.emit(DOCUMENT.VISIBILITYCHANGE, { isHidden: document.visibilityState === 'hidden' });
});
