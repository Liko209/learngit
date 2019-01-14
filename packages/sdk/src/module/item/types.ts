/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:08:47
 * Copyright © RingCentral. All rights reserved.
 */

type ItemQueryOptions = {
  typeId: number;
  groupId: number;
  sortKey: string;
  desc: boolean;
  limit: number;
  offsetItemId: number | undefined;
  filterFunc?: (value: any, index?: number) => boolean;
};

export { ItemQueryOptions };
