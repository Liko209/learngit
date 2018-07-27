import { api, dao, service } from 'sdk';

/**
 * Expose the classes and objects in order to
 * get them on devtool's console.
 **/
if (process.env.NODE_ENV === 'development') {
  Object.assign(global, api, dao, service);
}
