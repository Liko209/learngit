/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-28 10:47:04
 * Copyright © RingCentral. All rights reserved.
 */
import { RCURIInfo } from './RCURIInfo';
type RCNavigationInfo = {
  firstPage?: RCURIInfo;
  nextPage?: RCURIInfo;
  previousPage?: RCURIInfo;
  lastPage?: RCURIInfo;
};

export { RCNavigationInfo };
