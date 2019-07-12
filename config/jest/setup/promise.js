import { proxyPromise } from '../../proxyPromise';

if (process.env.PROMISE_LOG) {
  // for debug
  window.Promise = proxyPromise(reason => {
    console.warn('on reject: ', reason);
    console.trace();
  });
}
