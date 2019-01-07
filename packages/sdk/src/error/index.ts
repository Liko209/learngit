/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:36
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_NETWORK } from 'foundation';
import { ERROR_TYPES } from './types';
import { ERROR_CODES_SERVER } from './server';
export * from './db';
export * from './sdk';
export * from './server';
export * from './types';
export {
  JError,
  errorParser,
  JNetworkError,
  JRuntimeError,
  ERROR_CODES_NETWORK,
  ERROR_CODES_RUNTIME,
  isErrorMatch,
} from 'foundation';

export const ERROR_CONDITIONS = {
  NOT_NETWORK: {
    type: ERROR_TYPES.NETWORK,
    codes: [ERROR_CODES_NETWORK.NOT_NETWORK],
  },
  NOT_AUTHORIZED: {
    type: ERROR_TYPES.SERVER,
    codes: [
      ERROR_CODES_SERVER.NOT_AUTHORIZED,
    ],
  },
  BACKEND_ERROR: [
    {
      type: ERROR_TYPES.SERVER,
      codes: [
        '*',
      ],
    },
    {
      type: ERROR_TYPES.NETWORK,
      codes: [
        '*',
      ],
    },
  ],
};
