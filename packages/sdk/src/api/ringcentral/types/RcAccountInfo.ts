/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 11:27:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RcCountryInfo, RcRegionalSetting, RcStatusInfo } from './common';

type RcNestExtensionInfo = {
  uri?: string;
  id?: number;
  extensionNumber?: string;
  partnerId?: string;
};

type RcBrandInfo = {
  id?: string;
  name?: string;
  homeCountry?: RcCountryInfo;
};

type RcServicePlanInfo = {
  id?: string;
  name?: string;
  edition?: string;
};

type RcBillingPlanInfo = {
  id?: string;
  name?: string;
  durationUnit?: string;
  duration?: number;
  type?: string;
  includedPhoneLines?: number;
};

type RcTargetServicePlanInfo = {
  id?: string;
  name?: string;
};

type RcServiceInfo = {
  uri?: string;
  brand?: RcBrandInfo;
  servicePlan?: RcServicePlanInfo;
  billingPlan?: RcBillingPlanInfo;
  targetServicePlan?: RcTargetServicePlanInfo;
};

type RcAccountInfo = {
  uri?: string;
  id?: number;
  mainNumber?: string;
  operator?: RcNestExtensionInfo;
  partnerId?: string;
  serviceInfo?: RcServiceInfo;
  setupWizardState?: string;
  regionalSettings?: RcRegionalSetting;
  status?: string;
  statusInfo?: RcStatusInfo;
  outboundCallPrefix?: number;
};

export { RcAccountInfo };
