/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 11:27:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RCCountryInfo, RCRegionalSetting, RCStatusInfo } from './common';

type RCNestExtensionInfo = {
  uri?: string;
  id?: number;
  extensionNumber?: string;
  partnerId?: string;
};

type RCBrandInfo = {
  id?: string;
  name?: string;
  homeCountry?: RCCountryInfo;
};

type RCServicePlanInfo = {
  id?: string;
  name?: string;
  edition?: string;
};

type RCBillingPlanInfo = {
  id?: string;
  name?: string;
  durationUnit?: string;
  duration?: number;
  type?: string;
  includedPhoneLines?: number;
};

type RCTargetServicePlanInfo = {
  id?: string;
  name?: string;
};

type RCServiceInfo = {
  uri?: string;
  brand?: RCBrandInfo;
  servicePlan?: RCServicePlanInfo;
  billingPlan?: RCBillingPlanInfo;
  targetServicePlan?: RCTargetServicePlanInfo;
};

type RCAccountInfo = {
  uri?: string;
  id?: number;
  mainNumber?: string;
  operator?: RCNestExtensionInfo;
  partnerId?: string;
  serviceInfo?: RCServiceInfo;
  setupWizardState?: string;
  regionalSettings?: RCRegionalSetting;
  status?: string;
  statusInfo?: RCStatusInfo;
  outboundCallPrefix?: number;
};

export { RCAccountInfo };
