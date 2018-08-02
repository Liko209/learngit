/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-03-21 14:33:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as HttpStatus from 'http-status-codes';
// import _ from 'lodash';

const ErrorTypes = {
  UNDEFINED_ERROR: 0,
  HTTP: 1000,
  DB: 2000,
  SERVICE: 3000,
  INVALIDTE_PARAMETERS: 3001,
  OAUTH: 4000,
  NETWORK: 5000,
  INVALID_GRANT: 4147
};

Object.keys(HttpStatus).forEach((key: string) => {
  ErrorTypes[key] = ErrorTypes.HTTP + HttpStatus[key];
});

export default ErrorTypes;
