/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

const networkErrorFunc = () => {
  throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
};

const serverErrorFunc = () => {
  throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
};

export { networkErrorFunc, serverErrorFunc };
