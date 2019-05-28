/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-28 10:51:24
 * Copyright © RingCentral. All rights reserved.
 */

type RCPagingInfo = {
  page?: string;
  perPage: string;
  pageStart: string;
  pageEnd: string;
  totalPages?: string;
  totalElements?: string;
};

export { RCPagingInfo };
