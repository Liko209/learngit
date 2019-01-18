/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { TabConfig } from './config';

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
};

type ViewProps = {
  ids: number[];
  totalCount: number;
  loading: boolean;
  firstLoaded: boolean;
  loadError: boolean;
  tabConfig: TabConfig;
  fetchNextPageItems: () => Promise<any>;
};

export { Props, ViewProps };
