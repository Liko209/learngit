/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 11:09:36
 * Copyright © RingCentral. All rights reserved.
 */

type RCClientApplicationInfo = {
  detected?: boolean;
  userAgent?: string;
  appId?: string;
  appName?: string;
  appVersion?: string;
  appPlatform?: string;
  appPlatformVersion?: string;
  locale?: string;
};

type RCClientProvisioningClientIds = {
  serviceWeb?: string;
  expressSetup?: string;
  liveReports?: string;
  qosReports?: string;
  analyticsPortal?: string;
};

type RCClientProvisioningWebUris = {
  expressSetupMobile?: string;
  signUp?: string;
  support?: string;
  mobileWebUsers?: string;
  mobileWebBilling?: string;
  mobileWebPhoneSystem?: string;
  mobileWebUserSettings?: string;
  mobileWebTellAFriend?: string;
  mobileWebChangePassword?: string;
  mobileWebInternationalCalling?: string;
  mobileWebCallHandling?: string;
  mobileWebNotifications?: string;
  mobileWebResetPassword?: string;
  mobileWebTrialUpgrade?: string;
  serviceWebHome?: string;
  mobileAssetsHome?: string;
  eula?: string;
  emergencyDisclaimer?: string;
  liveReports?: string;
  mobileWebReporting?: string;
  mobileWebQosReports?: string;
  analyticsPortal?: string;
  expiresIn?: number;
  timestamp?: number;
};

type RCHint = {
  expiresIn?: number;
  actionRequired?: boolean;
};

type RCClientProvisioningHint = {
  trialState?: RCHint;
  userCredentialState?: RCHint;
  appVersionUpgrade?: RCHint;
};

type RCClientProvisioningInfo = {
  interopClientIds?: RCClientProvisioningClientIds;
  webUris?: RCClientProvisioningWebUris;
  hints?: RCClientProvisioningHint;
};

type RCClientInfo = {
  uri?: string;
  client?: RCClientApplicationInfo;
  provisioning?: RCClientProvisioningInfo;
};

export { RCClientInfo };
