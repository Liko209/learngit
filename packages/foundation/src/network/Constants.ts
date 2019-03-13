/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:17
 * Copyright © RingCentral. All rights reserved.
 */
import config from '../config';

const DEFAULT_BEFORE_EXPIRED = config.beforeExpired;

const DEFAULT_TIMEOUT_INTERVAL = config.timeout;

const TEN_MINUTE_TIMEOUT = 10 * 60 * 1000;

const DEFAULT_RETRY_COUNT = 3;

const SURVIVAL_MODE_URIS = config.survivalModeUris;

export {
  DEFAULT_BEFORE_EXPIRED,
  DEFAULT_TIMEOUT_INTERVAL,
  TEN_MINUTE_TIMEOUT,
  DEFAULT_RETRY_COUNT,
  SURVIVAL_MODE_URIS,
};
