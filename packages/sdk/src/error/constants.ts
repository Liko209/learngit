import { ERROR_CODES_NETWORK, ErrorCondition } from 'foundation/error';
import { ERROR_TYPES } from './types';
import { ERROR_CODES_SERVER } from './server';

export const ERROR_CONDITIONS: {
  [key: string]: ErrorCondition | ErrorCondition[];
} = {
  NOT_NETWORK: {
    type: ERROR_TYPES.NETWORK,
    codes: [
      ERROR_CODES_NETWORK.NOT_NETWORK,
      ERROR_CODES_NETWORK.NETWORK_ERROR,
      ERROR_CODES_NETWORK.LOCAL_TIMEOUT,
    ],
  },
  NOT_AUTHORIZED: {
    type: ERROR_TYPES.SERVER,
    codes: [ERROR_CODES_SERVER.NOT_AUTHORIZED],
  },
  BACKEND_ERROR: [
    {
      type: ERROR_TYPES.SERVER,
      codes: ['*'],
    },
    {
      type: ERROR_TYPES.NETWORK,
      codes: ['*'],
      excludeCodes: [
        ERROR_CODES_NETWORK.NOT_NETWORK,
        ERROR_CODES_NETWORK.NETWORK_ERROR,
        ERROR_CODES_NETWORK.LOCAL_TIMEOUT,
      ],
    },
  ],
};
