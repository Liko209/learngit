/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:17
 * Copyright © RingCentral. All rights reserved.
 */
import config from '../config';

const DEFAULT_BEFORE_EXPIRED = config.beforeExpired;

const DEFAULT_TIMEOUT_INTERVAL = config.timeout;

const RESPONSE_HEADER_KEY = {
  RETRY_AFTER: 'Retry-After',
};

const SERVER_ERROR_CODE = {
  CMN211: 'CMN-211',
};

export {
  DEFAULT_BEFORE_EXPIRED,
  DEFAULT_TIMEOUT_INTERVAL,
  RESPONSE_HEADER_KEY,
  SERVER_ERROR_CODE,
};
