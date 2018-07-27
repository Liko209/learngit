/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-24 16:54:49
 * Copyright © RingCentral. All rights reserved.
 */
import ItemListPresenter from './ItemListPresenter';

const MAX_CONVERSATION_THREAD = 5;

export default class RightRailItemsPresente {
  constructor() {
    this.itemListPresenters = new Map();
  }

  addItemList(groupId, typeId, sortKey, reverse) {
    console.log(sortKey, reverse);
    const newItemListPresenter = new ItemListPresenter(
      groupId,
      typeId,
      sortKey,
      reverse
    );
    let itemListMap = this.itemListPresenters.get(groupId);
    if (itemListMap) {
      itemListMap.set(typeId, newItemListPresenter);
    } else {
      itemListMap = new Map();
      itemListMap.set(typeId, newItemListPresenter);
      this.itemListPresenters.set(groupId, itemListMap);
    }
    return itemListMap;
  }

  delItemList(groupId) {
    const itemListMap = this.itemListPresenters.get(groupId);
    itemListMap.forEach((value, key) => {
      this.dispose(groupId, key);
    });
    this.itemListPresenters.delete(groupId);
  }

  getItemList(groupId, typeId, sortKey, reverse) {
    let itemListMap = this.itemListPresenters.get(groupId);
    if (!itemListMap) {
      this.checkCache();
      itemListMap = this.addItemList(groupId, typeId, sortKey, reverse);
    }
    return itemListMap.get(typeId);
  }

  removeFirstItemList() {
    const firstKey = this.itemListPresenters.keys().next().value;
    return this.delItemList(firstKey);
  }

  loadItems(groupId, typeId, sortKey, reverse) {
    const itemListPresenter = this.getItemList(
      groupId,
      typeId,
      sortKey,
      reverse
    );
    itemListPresenter.loadItems();
  }

  checkCache() {
    const itemListSize = this.getSize();
    if (itemListSize === MAX_CONVERSATION_THREAD) {
      this.removeFirstItemList();
    }
  }

  getStore(groupId, typeId, sortKey, reverse) {
    const itemListPresenter = this.getItemList(
      groupId,
      typeId,
      sortKey,
      reverse
    );
    if (itemListPresenter) {
      return itemListPresenter.getStore();
    }
    return null;
  }

  dispose(groupId, typeId, sortKey, reverse) {
    if (groupId) {
      const itemListPresenter = this.getItemList(
        groupId,
        typeId,
        sortKey,
        reverse
      );
      itemListPresenter.dispose();
    } else {
      this.itemListPresenters.forEach(itemListMap => {
        itemListMap.forEach(presenter => {
          presenter.dispose();
        });
      });
    }
  }

  getSize() {
    return this.itemListPresenters.size;
  }
}
