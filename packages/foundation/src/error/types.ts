/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:53:52
 * Copyright © RingCentral. All rights reserved.
 */
const ERROR_TYPES = {
  RUNTIME: 'RUNTIME',
  NETWORK: 'NETWORK',
  UNDEFINED: 'UNDEFINED',
};

type ErrorCondition = {
  type: string;
  codes: string[];
};

export {
  ERROR_TYPES,
  ErrorCondition,
};
