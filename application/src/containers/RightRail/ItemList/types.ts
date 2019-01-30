/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { TabConfig } from './config';

type LoadStatus = {
  firstLoaded: boolean;
  loadError: boolean;
  loading: boolean;
};

const InitLoadStatus: LoadStatus = {
  firstLoaded: false,
  loadError: false,
  loading: false,
};

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
  active: boolean;
};

type ViewProps = {
  ids: number[];
  totalCount: number;
  loadStatus: LoadStatus;
  tabConfig: TabConfig;
  forceReload: () => void;
  fetchNextPageItems: () => Promise<any>;
};

export { Props, ViewProps, LoadStatus, InitLoadStatus };
