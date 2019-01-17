/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { ITEM_SORT_KEYS } from 'sdk/module/item';

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
  sortKey?: ITEM_SORT_KEYS;
  desc?: boolean;
};

type ViewProps = {
  ids: number[];
  totalCount: number;
  fetchNextPageItems: () => void;
};

export { Props, ViewProps };
