/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 09:54:32
 * Copyright © RingCentral. All rights reserved.
 */

import { RcRegionalSetting, RcStatusInfo } from './common';

type RcContactAddress = {
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  zip?: string;
};

type RcPronouncedName = {
  type?: string;
  text?: string;
};

type RcContactInfo = {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  businessPhone?: string;
  businessAddress?: RcContactAddress;
  emailAsLoginName?: boolean;
  pronouncedName?: RcPronouncedName;
  department?: string;
};

type RcDepartmentInfo = {
  uri?: string;
  id?: string;
  extensionNumber?: string;
};

type RcExtensionAccount = {
  uri?: string;
  id?: string;
};

type RcExtensionPermissions = {
  admin?: {
    enabled: boolean;
  };
  internationalCalling?: {
    enabled: boolean;
  };
};

type RcProfileImageInfo = {
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

type RcReferenceInfo = {
  ref?: string;
  type?: string;
};

type RcServiceFeature = {
  enabled?: boolean;
  featureName: string;
  reason?: string;
};

type RcSite = {
  uri?: string;
  id?: string;
  name?: string;
  code?: string;
};

type RcExtensionInfo = {
  uri?: string;
  id: number;
  contact?: RcContactInfo;
  departments?: RcDepartmentInfo[];
  extensionNumber?: string;
  account?: RcExtensionAccount;
  name?: string;
  partnerId?: string;
  permissions?: RcExtensionPermissions;
  profileImage?: RcProfileImageInfo;
  references?: RcReferenceInfo[];
  regionalSettings?: RcRegionalSetting;
  serviceFeatures?: RcServiceFeature[];
  setupWizardState?: string;
  status?: string;
  statusInfo?: RcStatusInfo;
  type?: string;
  site?: RcSite;
};

export { RcExtensionInfo, RcServiceFeature };
