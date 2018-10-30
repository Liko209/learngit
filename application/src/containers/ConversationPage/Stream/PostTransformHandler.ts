/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-25 11:55:22
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { Post } from 'sdk/models';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import {
  FetchDataDirection,
  ISortableModel,
  TUpdated,
} from '@/store/base/fetch/types';
import { TransformHandler } from '@/store/base/TransformHandler';

import { ISeparatorHandler } from './ISeparatorHandler';
import { NewMessageSeparatorHandler } from './NewMessageSeparatorHandler';
import {
  Separator,
  StreamItem,
  StreamItemType,
  SeparatorType,
  DateSeparator,
} from './types';

class PostTransformHandler extends TransformHandler<StreamItem, Post> {
  private _separatorHandlers: ISeparatorHandler[] = [];
  private _newMessageSeparatorHandler: NewMessageSeparatorHandler;

  onAppended: Function;

  @computed
  get separatorMap() {
    // key => postId
    const map = new Map<number, Separator>();

    // Merge separatorMaps of separatorHandlers
    this._separatorHandlers.forEach((handler: ISeparatorHandler) => {
      handler.separatorMap.forEach((separator: Separator, postId: number) => {
        map.set(postId, separator);
      });
    });

    return map;
  }

  @computed
  get postIds() {
    return this.orderListStore.getIds();
  }

  @computed
  get items(): StreamItem[] {
    return PostTransformHandler.toStreamItems(
      this.orderListStore.getIds(),
      this.separatorMap,
    );
  }

  constructor({
    handler,
    newMessageSeparatorHandler,
  }: {
    handler: FetchSortableDataListHandler<Post>;
    newMessageSeparatorHandler: NewMessageSeparatorHandler;
  }) {
    super(handler);
    this._newMessageSeparatorHandler = newMessageSeparatorHandler;
    this._separatorHandlers.push(this._newMessageSeparatorHandler);
  }

  onAdded(direction: FetchDataDirection, addedItems: ISortableModel<Post>[]) {
    this._separatorHandlers.forEach(separatorHandler =>
      separatorHandler.onAdded(direction, addedItems, this.orderListStore.items),
    );
  }

  onDeleted(deletedItems: number[]) {
    this._separatorHandlers.forEach(separatorHandler =>
      separatorHandler.onDeleted(deletedItems, this.orderListStore.items),
    );
  }

  onUpdated(updatedIds: TUpdated) {
    updatedIds.forEach(item =>
      this.orderListStore.replaceAt(item.index, item.value),
    );
  }

  /**
   * Transform raw data into streamItems
   * @param postIds
   * @param separatorMap
   */
  static toStreamItems(
    postIds: number[],
    separatorMap: Map<number, Separator>,
  ): StreamItem[] {
    const streamItems: StreamItem[] = [];
    postIds.forEach((postId: number) => {
      const separator = separatorMap.get(postId);
      if (separator) {
        const separatorStreamItem = this._buildSeparatorStreamItem(separator);
        streamItems.push(separatorStreamItem);
      }

      streamItems.push({
        type: StreamItemType.POST,
        value: postId,
      });
    });
    return streamItems;
  }

  private static _buildSeparatorStreamItem(separator: Separator): StreamItem {
    switch (separator.type) {
      case SeparatorType.NEW_MSG:
        return {
          type: StreamItemType.NEW_MSG_SEPARATOR,
          value: null,
        };
      case SeparatorType.DATE:
        return {
          type: StreamItemType.DATE_SEPARATOR,
          value: (separator as DateSeparator).timestamp,
        };
    }
  }
}

export { PostTransformHandler };
