/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-04 09:39:20
 * Copyright © RingCentral. All rights reserved.
 */

// unit: seconds
export const kRTCProvRequestErrorRetryTimerMin = 8;
export const kRTCProvRequestErrorRetryTimerMax = 3600;
export const kRTCProvParamsErrorRetryTimer = 7200;
export const kRTCProvFreshTimer = 24 * 3600;
export const kRTCProvRefreshByRegFailedInterval = 3600;
export const kRTCMaxCallCount = 1;
export const kRTCAnonymous = 'anonymous';
export const kRTCHangupInvalidCallInterval = 10;
export const kRTCGetStatsInterval = 2;
export const kRTCProvisioningOptions = {
  appName: 'RingCentral Jupiter',
  builtinEnabled: false,
  audioHelper: {
    enabled: true,
  },
  logLevel: 10,
  maxReconnectionAttempts: '0',
  reconnectionTimeout: '5',
  connectionTimeout: '5',
};
