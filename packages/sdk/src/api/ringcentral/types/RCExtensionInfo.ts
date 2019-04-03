/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 09:54:32
 * Copyright © RingCentral. All rights reserved.
 */

import { RCRegionalSetting, RCStatusInfo } from './common';

type RCContactAddress = {
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zip?: string;
};

type RCPronouncedName = {
  type?: string;
  text?: string;
};

type RCContactInfo = {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  businessPhone?: string;
  businessAddress?: RCContactAddress;
  emailAsLoginName?: boolean;
  pronouncedName?: RCPronouncedName;
  department?: string;
};

type RCDepartmentInfo = {
  uri?: string;
  id?: string;
  extensionNumber?: string;
};

type RCExtensionAccount = {
  uri?: string;
  id?: string;
};

type RCExtensionPermissions = {
  admin?: {
    enabled: boolean;
  };
  internationalCalling?: {
    enabled: boolean;
  };
};

type RCProfileImageInfo = {
  uri?: string;
  etag?: string;
  contentType?: string;
  lastModified?: string;
  scales?: [
    {
      uri: string;
    }
  ];
};

type RCReferenceInfo = {
  ref?: string;
  type?: string;
};

type RCServiceFeature = {
  enabled?: boolean;
  featureName: string;
  reason?: string;
};

type RCSite = {
  uri?: string;
  id?: string;
  name?: string;
  code?: string;
};

type RCExtensionInfo = {
  uri?: string;
  id: number;
  contact?: RCContactInfo;
  departments?: RCDepartmentInfo[];
  extensionNumber?: string;
  account?: RCExtensionAccount;
  name?: string;
  partnerId?: string;
  permissions?: RCExtensionPermissions;
  profileImage?: RCProfileImageInfo;
  references?: RCReferenceInfo[];
  regionalSettings?: RCRegionalSetting;
  serviceFeatures?: RCServiceFeature[];
  setupWizardState?: string;
  status?: string;
  statusInfo?: RCStatusInfo;
  type?: string;
  site?: RCSite;
};

export { RCExtensionInfo, RCServiceFeature };
