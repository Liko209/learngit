/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-25 11:55:22
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, transaction } from 'mobx';
import { Post } from 'sdk/module/post/entity';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { ISortableModel, TUpdated } from '@/store/base/fetch/types';
import { TransformHandler } from '@/store/base/TransformHandler';
import { ISeparatorHandler } from './ISeparatorHandler';
import { QUERY_DIRECTION } from 'sdk/dao';
import {
  Separator,
  StreamItem,
  StreamItemType,
  SeparatorType,
  DateSeparator,
} from './types';

class PostTransformHandler extends TransformHandler<StreamItem, Post> {
  private _separatorHandlers: ISeparatorHandler[] = [];

  onAppended: Function;

  @computed
  get separatorMap() {
    return PostTransformHandler.combineSeparatorHandlersMaps(
      this._separatorHandlers,
    );
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
    separatorHandlers,
  }: {
    handler: FetchSortableDataListHandler<Post>;
    separatorHandlers: ISeparatorHandler[];
  }) {
    super(handler);
    this._separatorHandlers.push(...separatorHandlers);
  }

  onAdded(direction: QUERY_DIRECTION, addedItems: ISortableModel<Post>[]) {
    transaction(() => {
      this._separatorHandlers.forEach((separatorHandler: ISeparatorHandler) => {
        separatorHandler.onAdded(
          direction,
          addedItems,
          this.orderListStore.items,
          this.hasMore(QUERY_DIRECTION.OLDER), // separatorHandler should only care whether the older posts loaded yet.
        );
      });
    });
  }

  onDeleted(deletedItems: number[]) {
    transaction(() => {
      this._separatorHandlers.forEach(separatorHandler =>
        separatorHandler.onDeleted(deletedItems, this.orderListStore.items),
      );
    });
  }

  onUpdated(updatedIds: TUpdated) {
    transaction(() => {
      updatedIds.forEach(item =>
        this.orderListStore.replaceAt(item.index, item.value),
      );
    });
  }

  removeByIds(ids: number[]) {
    this._orderListHandler.removeByIds(ids);
  }

  upsert(posts: Post[]) {
    this._orderListHandler.upsert(posts);
  }

  replaceAll(posts: Post[]) {
    this._orderListHandler.replaceAll(posts);
  }

  static combineSeparatorHandlersMaps(handlers: ISeparatorHandler[]) {
    // key => postId
    const map = new Map<number, Separator>();

    // Merge separatorMaps of separatorHandlers
    handlers
      .sort((a, b) => a.priority - b.priority)
      .forEach((handler: ISeparatorHandler) => {
        handler.separatorMap.forEach((separator: Separator, postId: number) => {
          map.set(postId, separator);
        });
      });

    return map;
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

    // First item can not be separator
    const firstStreamItem = streamItems[0];
    if (
      firstStreamItem &&
      (firstStreamItem.type === StreamItemType.DATE_SEPARATOR ||
        firstStreamItem.type === StreamItemType.NEW_MSG_SEPARATOR)
    ) {
      streamItems.shift();
    }

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
