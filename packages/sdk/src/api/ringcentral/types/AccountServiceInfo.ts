/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-29 14:20:48
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RCServicePlanInfo,
  RCBillingPlanInfo,
  RCServiceFeature,
  RCBrandInfo,
} from './common';

type AccountServiceInfoLimits = {
  freeSoftPhoneLinesPerExtension?: number;
  meetingSize?: number;
  maxMonitoredExtensionsPerUser?: number;
  maxExtensionNumberLength?: number;
  shortExtensionNumberLength?: number;
};

type AccountServiceInfo = {
  billingPlan?: RCBillingPlanInfo;
  brand?: RCBrandInfo;
  limits?: AccountServiceInfoLimits;
  serviceFeatures?: RCServiceFeature[];
  servicePlan?: RCServicePlanInfo;
  servicePlanName: string;
  uri: string;
};

export { AccountServiceInfo };
