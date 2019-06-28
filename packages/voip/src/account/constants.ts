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

export const defaultAudioID = 'default';
export const kRetryIntervalList = [
  { min: 2, max: 6 },
  { min: 10, max: 20 },
  { min: 20, max: 40 },
  { min: 40, max: 80 },
  { min: 80, max: 120 },
  { min: 80, max: 120 },
  { min: 80, max: 120 },
  { min: 80, max: 120 },
  { min: 80, max: 120 },
  { min: 120, max: 240 },
  { min: 240, max: 480 },
  { min: 480, max: 960 },
  { min: 960, max: 1920 },
  { min: 1920, max: 3840 },
];
