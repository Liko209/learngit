/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Item } from 'sdk/module/item/entity';

type LoadStatus = {
  firstLoaded: boolean;
  loading: boolean;
};

const InitLoadStatus: LoadStatus = {
  firstLoaded: false,
  loading: false,
};

interface IGroupItemListHandler extends FetchSortableDataListHandler<Item> {
  total: number;
}

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
  width: number;
  height: number;
};

type ViewProps = {
  listHandler: IGroupItemListHandler;
};

export { Props, ViewProps, LoadStatus, InitLoadStatus, IGroupItemListHandler };
