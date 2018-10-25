/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ISeparatorHandler } from './ISeparatorHandler';
import { FetchDataDirection, ISortableModel } from '@/store/base';
import { observable } from 'mobx';
import { NewSeparator, SeparatorType } from './types';
import _ from 'lodash';

class NewMessageSeparatorHandler implements ISeparatorHandler {
  priority = 2;
  private _readThrough?: number;
  private _disabled?: boolean;

  @observable
  separatorMap = new Map<number, NewSeparator>();

  onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel[],
    allItems: ISortableModel[],
  ): void {
    if (this._disabled) return;

    // If no readThrough, it means no unread posts.
    if (!this._readThrough) return;

    // If the `New Messages` separator already existed,
    // it will never be modified when receive new posts
    if (this.separatorMap.size > 0) return;

    const target = addedItems.find(item => item.id === this._readThrough);
    if (target) {
      this._setSeparator(target.id);
    }
  }

  onDeleted(deletedItemIds: number[], allItems: ISortableModel[]): void {
    const deletedPostWithSeparator = deletedItemIds.find(postId =>
      this.separatorMap.has(postId),
    );

    if (!deletedPostWithSeparator) return;

    this.separatorMap.delete(deletedPostWithSeparator);

    // Find first post next to the deleted post that has separator
    const postNext = allItems.find(({ id }: ISortableModel) => {
      return id > deletedPostWithSeparator;
    });

    // The deleted one is the last post
    if (!postNext) return;

    this._setSeparator(postNext.id);
  }

  setReadThrough(readThrough: number) {
    this._readThrough = readThrough;
  }

  /**
   * When the user received a new post, and the user is at the
   * bottom of stream, we should not add `New Messages` separator.
   */
  disable() {
    this._disabled = true;
  }

  /**
   * When the user scrolled up to read history posts, new received
   * new posts should be
   */
  enable() {
    this._disabled = false;
  }

  private _setSeparator(postId: number) {
    const separator: NewSeparator = {
      type: SeparatorType.NEW_MSG,
    };
    this.separatorMap.set(postId, separator);
  }
}

export { NewMessageSeparatorHandler };
