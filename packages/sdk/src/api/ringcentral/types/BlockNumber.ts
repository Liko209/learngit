/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-24 09:09:50
 * Copyright © RingCentral. All rights reserved.
 */

import { INavigationInfo, PagingInfo } from './common';

type GetBlockNumberListParams = {
  page: number;
  perPage: number;
  status: BLOCK_STATUS;
};

enum BLOCK_STATUS {
  BLOCKED = 'Blocked',
  ALLOWED = 'Allowed',
}

type AddBlockNumberParams = {
  phoneNumber: string;
  status: BLOCK_STATUS;
};

type BlockNumberItem = {
  uri?: string;
  id: string;
  phoneNumber: string;
  label?: string;
  status: BLOCK_STATUS;
};

type BlockNumberListResponse = {
  uri: string;
  records: BlockNumberItem[];
  navigation: INavigationInfo;
  paging: PagingInfo;
};

export {
  GetBlockNumberListParams,
  BlockNumberListResponse,
  BlockNumberItem,
  BLOCK_STATUS,
  AddBlockNumberParams,
};
