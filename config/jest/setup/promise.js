import { proxyPromise } from '../../proxyPromise';

if (process.env.PROMISE) {
  // for debug
  window.Promise = proxyPromise(reason => {
    console.warn('on reject: ', reason);
    console.trace();
  });
}
