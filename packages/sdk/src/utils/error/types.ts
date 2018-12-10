/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 14:33:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as HttpStatus from 'http-status-codes';

const ErrorTypes = {
  // TODO move API error codes to api/
  API: 1000,
  API_INVALID_GRANT: 1147,
  API_NETWORK: 5000, // TODO unified API error codes
  API_ALREADY_TAKEN: 6001,
  API_INVALID_FIELD: 6002,

  // TODO move DB error codes to dao/
  DB: 2000,
  DB_CRITICAL_ERROR: 2001,
  DB_NEED_RETRY_ERROR: 2002,
  DB_UNSUPPORTED_ERROR: 2003,
  DB_INVALID_USAGE_ERROR: 2004,

  // TODO move service error codes to service/
  SERVICE: 3000,
  SERVICE_INVALID_FIELD: 3001,
  SERVICE_INVALID_MODEL_ID: 3002,

  // TODO move auth error codes to authenticator/
  OAUTH: 4000,
  OAUTH_INVALID_GRANT: 4147,

  UNDEFINED_ERROR: 0,
};

Object.keys(HttpStatus).forEach((key: string) => {
  ErrorTypes[key] = ErrorTypes.API + HttpStatus[key];
});

const HttpError = {
  GATE_WAY_504: 1504,
};

export default ErrorTypes;
export { HttpError, ErrorTypes };
