/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-27 15:27:49
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import OrderListStore from '#/store/base/OrderListStore';
import OrderListPresenter from '#/store/base/OrderListPresenter';

import { ENTITY_NAME } from '#/store';

import { GlipTypeDictionary } from 'sdk';
import { service } from 'sdk';

const { notificationCenter, ItemService, ENTITY } = service;

const transformFunc = (sortKey, reverse) => dataModel => ({
  id: dataModel.id,
  sortKey: -dataModel[sortKey] * (reverse ? -1 : 1)
});
const LIMIT = 20;
export default class ItemListPresenter extends OrderListPresenter {
  constructor(groupId, typeId, sortKey, reverse) {
    super(
      new OrderListStore(`ConversationThread: ${groupId}`),
      ({ group_ids, type_id }) =>
        group_ids.indexOf(groupId) >= 0 && type_id === typeId,
      transformFunc(sortKey, reverse)
    );
    this.groupId = groupId;
    this.typeId = typeId;
    // this.hasMore = true;
    notificationCenter.setMaxListeners(26);
    this.subscribeNotification(ENTITY.ITEM, ({ type, entities }) => {
      entities.forEach((value, key) => {
        if (this.shouldHide(value)) {
          entities.delete(key);
        }
      });
      this.handleIncomingData(ENTITY_NAME.ITEM, { type, entities });
      this.applyLimit();
    });
  }

  async loadItems() {
    const itemService = ItemService.getInstance();
    const items = await itemService.getRightRailItemsOfGroup(
      Number(this.groupId),
      LIMIT
    );
    _.remove(items, this.shouldHide.bind(this));
    this.handlePageData(ENTITY_NAME.ITEM, items, true);
  }

  shouldHide(item) {
    return (
      (item.type_id === GlipTypeDictionary.TYPE_ID_TASK && item.complete) ||
      (item.type_id === GlipTypeDictionary.TYPE_ID_PAGE && item.is_draft) ||
      (item.type_id === GlipTypeDictionary.TYPE_ID_EVENT &&
        this.shouldHideEvent(item)) ||
      (item.type_id === GlipTypeDictionary.TYPE_ID_FILE &&
        item.post_ids.length === 0)
    );
  }

  shouldHideEvent(event) {
    const today = moment()
      .startOf('day')
      .valueOf();
    if (event.repeat !== 'none') {
      return event.effective_end <= today;
    }
    return (
      event.start < today || event.start > today + 14 * 24 * 60 * 60 * 1000
    );
  }

  handlePageData(entityName, dataModels) {
    if (!dataModels.length) {
      return;
    }
    const handledData = [];
    dataModels.forEach(item => {
      if (this.isMatchedFunc(item)) {
        handledData.push(this.transformFunc(item));
      }
    });

    this.updateEntityStore(entityName, dataModels);
    this.store.batchSet(handledData);
  }

  getSize() {
    return this.store.getSize();
  }

  applyLimit() {
    if (this.store.getSize() > LIMIT) {
      this.store.batchRemove(this.store.getIds().slice(LIMIT));
    }
  }
}
