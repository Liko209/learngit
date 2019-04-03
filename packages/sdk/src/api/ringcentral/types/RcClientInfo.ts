/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 11:09:36
 * Copyright © RingCentral. All rights reserved.
 */

type RcClientApplicationInfo = {
  detected?: boolean;
  userAgent?: string;
  appId?: string;
  appName?: string;
  appVersion?: string;
  appPlatform?: string;
  appPlatformVersion?: string;
  locale?: string;
};

type RcClientProvisioningClientIds = {
  serviceWeb?: string;
  expressSetup?: string;
  liveReports?: string;
  qosReports?: string;
  analyticsPortal?: string;
};

type RcClientProvisioningWebUris = {
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

type RcHint = {
  expiresIn?: number;
  actionRequired?: boolean;
};

type RcClientProvisioningHint = {
  trialState?: RcHint;
  userCredentialState?: RcHint;
  appVersionUpgrade?: RcHint;
};

type RcClientProvisioningInfo = {
  interopClientIds?: RcClientProvisioningClientIds;
  webUris?: RcClientProvisioningWebUris;
  hints?: RcClientProvisioningHint;
};

type RcClientInfo = {
  uri?: string;
  client?: RcClientApplicationInfo;
  provisioning?: RcClientProvisioningInfo;
};

export { RcClientInfo };
