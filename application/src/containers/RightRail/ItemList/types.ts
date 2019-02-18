/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { ItemListDataSource } from './ItemList.DataSource';

type LoadStatus = {
  firstLoaded: boolean;
  loading: boolean;
};

const InitLoadStatus: LoadStatus = {
  firstLoaded: false,
  loading: false,
};

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
  active: boolean;
};

type ViewProps = {
  dataSource: ItemListDataSource;
};

export { Props, ViewProps, LoadStatus, InitLoadStatus };
