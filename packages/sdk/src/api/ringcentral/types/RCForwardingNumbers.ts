/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-28 10:30:04
 * Copyright © RingCentral. All rights reserved.
 */

import { RCURIInfo } from './RCURIInfo';
import { RCNavigationInfo } from './RCNavigationInfo';
import { RCPagingInfo } from './RCPagingInfo';
type RCExtensionForwardingNumberRequest = {
  page?: string;
  perPage?: string;
};

type RCExtensionForwardingNumberInfo = RCURIInfo & {
  id: string;
  phoneNumber: string;
  label: string;
  type: string;
  features: string;
  flipNumber: string;
};

type RCExtensionForwardingNumberRCList = RCURIInfo & {
  records: RCExtensionForwardingNumberInfo[];
  paging: RCPagingInfo;
  navigation: RCNavigationInfo;
};

export {
  RCExtensionForwardingNumberRequest,
  RCExtensionForwardingNumberInfo,
  RCExtensionForwardingNumberRCList,
};
