/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 11:27:37
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RCRegionalSetting,
  RCStatusInfo,
  RCServicePlanInfo,
  RCBillingPlanInfo,
  RCBrandInfo,
} from './common';

type RCNestExtensionInfo = {
  uri?: string;
  id?: number;
  extensionNumber?: string;
  partnerId?: string;
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
