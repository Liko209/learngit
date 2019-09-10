/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-03 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action, computed } from 'mobx';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { ItemService } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { VIEWER_ITEM_TYPE } from './constants';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { getFilterFunc } from './utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

type ItemListDataSourceByPostProps = {
  groupId: number;
  type: VIEWER_ITEM_TYPE;
  postId?: number;
};

class ItemListDataSourceByPost {
  @observable groupId: number;
  @observable postId: number;
  @observable type: VIEWER_ITEM_TYPE;

  constructor(props: ItemListDataSourceByPostProps) {
    const { groupId, type, postId = 0 } = props;
    this.groupId = groupId;
    this.postId = postId;
    this.type = type;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.postId);
  }

  @action
  async fetchData(): Promise<{ data: Item[]; hasMore: boolean }> {
    const { getVersionDate } = FileItemUtils;
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const result = await itemService.batchGet(this._post.itemIds);
    // filter by deactivated property
    const activatedData = result.filter((item: Item) => !item.deactivated);

    const itemFilter = getFilterFunc(this.groupId, this.type);
    const resultFilterData = itemFilter
      ? activatedData.filter((item: Item) => itemFilter(item))
      : activatedData;

    // sort by versions
    const sortResult = resultFilterData.sort((pre, next) => {
      const preTimestamp = getVersionDate(pre) || pre.created_at;
      const nextTimestamp = getVersionDate(next) || next.created_at;
      return preTimestamp - nextTimestamp;
    });

    return { data: sortResult, hasMore: false };
  }

  @action
  async loadInitialData() {
    const result = await this.fetchData();
    return await result.data;
  }

  @action
  getIds() {
    return this._post.itemIds;
  }

  @action
  async fetchIndexInfo(itemId: number) {
    const { data } = await this.fetchData();
    let index = -1;
    data.some((v, i) => {
      const idEqual = v.id === itemId;
      if (idEqual) {
        index = i;
      }
      return idEqual;
    });
    return {
      index,
      totalCount: data.length,
    };
  }

  // Unified interface with Viewer.DataSource
  dispose() {}
}

export { ItemListDataSourceByPost, ItemListDataSourceByPostProps };
