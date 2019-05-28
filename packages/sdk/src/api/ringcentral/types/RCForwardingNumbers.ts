/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-28 10:30:04
 * Copyright © RingCentral. All rights reserved.
 */

import { IUriInfo, INavigationInfo, PagingInfo } from './common';
type RCExtensionForwardingNumberRequest = {
  page?: string;
  perPage?: string;
};

type RCExtensionForwardingNumberInfo = IUriInfo & {
  id: string;
  phoneNumber: string;
  label: string;
  type: string;
  features: string;
  flipNumber: string;
};

type RCExtensionForwardingNumberRCList = IUriInfo & {
  records: RCExtensionForwardingNumberInfo[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

export {
  RCExtensionForwardingNumberRequest,
  RCExtensionForwardingNumberInfo,
  RCExtensionForwardingNumberRCList,
};
