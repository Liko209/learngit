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
  analyticsPortal?: string;
  emergencyDisclaimer?: string;
  eula?: string;
  eulaGlip?: string;
  expiresIn?: number;
  expressSetupMobile?: string;
  liveReports?: string;
  meetings?: string;
  meetingsRecordings?: string;
  mobileAppDownload?: string;
  mobileWebBilling?: string;
  mobileWebCallHandling?: string;
  mobileWebChangePassword?: string;
  mobileWebInternationalCalling?: string;
  mobileWebNotifications?: string;
  mobileWebPhoneSystem?: string;
  mobileWebQosReports?: string;
  mobileWebResetPassword?: string;
  mobileWebTellAFriend?: string;
  mobileWebTrialUpgrade?: string;
  mobileWebUserSettings?: string;
  mobileWebUsers?: string;
  privacyPolicy?: string;
  serviceWebBilling?: string;
  serviceWebBlockedCalls?: string;
  serviceWebCallHandling?: string;
  serviceWebChangePassword?: string;
  serviceWebHome?: string;
  serviceWebPhoneSystem?: string;
  serviceWebResetPassword?: string;
  serviceWebTellAFriend?: string;
  serviceWebUserPhones?: string;
  serviceWebUserSettings?: string;
  signUp?: string;
  support?: string;
  webinar?: string;
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
