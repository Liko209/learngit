/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-04 09:39:20
 * Copyright © RingCentral. All rights reserved.
 */

// unit: seconds
export const kRTCProvRequestErrorRertyTimerMin = 8;
export const kRTCProvRequestErrorRertyTimerMax = 3600;
export const kRTCProvParamsErrorRertyTimer = 7200;
export const kRTCProvFreshTimer = 24 * 3600;
export const kRTCProvRefreshByRegFailedInterval = 3600;
export const kRTCMaxCallCount = 1;
export const kRTCAnonymous = 'anonymous';
export const kRTCHangupInvalidCallInterval = 10;
export const kRTCGetStatsInterval = 2;
export const kRTCProvisioningOptions = {
  appName: 'RingCentral Jupiter',
  appVersion: '0.1.0',
  builtinEnabled: false,
  audioHelper: {
    enabled: true,
  },
  logLevel: 10,
  maxReconnectionAttempts: '0',
  reconnectionTimeout: '5',
  connectionTimeout: '5',
};

export const defaultAudioID = 'default';
