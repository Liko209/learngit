/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-25 14:56:53
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * Waits until pending Promises are resolved
 */
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

export { flushPromises };
