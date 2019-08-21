/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap } from '../constants';
import { ItemUtils } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil } from 'sdk/utils';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

function getTypeId(type: VIEWER_ITEM_TYPE) {
  return ViewerItemTypeIdMap[type];
}

function getFilterFunc(groupId: number, type: VIEWER_ITEM_TYPE) {
  switch (type) {
    case VIEWER_ITEM_TYPE.IMAGE_FILES:
      return (file: Item) => {
        if (!file) return false;
        return (
          ItemUtils.imageFilter(groupId)(file) &&
          FileItemUtils.isSupportPreview(file)
        );
      };
    default:
      return undefined;
  }
}

function isExpectedItemOfThisGroup(
  groupId: number,
  type: VIEWER_ITEM_TYPE,
  item: Item,
  includeDeactivated: boolean,
) {
  let isValidItem = item.post_ids.length > 0;
  if (!includeDeactivated) {
    isValidItem = !item.deactivated;
  }
  switch (type) {
    case VIEWER_ITEM_TYPE.IMAGE_FILES:
      isValidItem =
        isValidItem &&
        (getFilterFunc(groupId, type) as (valid: Item) => boolean)(item) &&
        GlipTypeUtil.extractTypeId(item.id) === getTypeId(type) &&
        ItemUtils.isValidItem(groupId, item);
      break;
    default:
      isValidItem =
        isValidItem &&
        GlipTypeUtil.extractTypeId(item.id) === getTypeId(type) &&
        ItemUtils.isValidItem(groupId, item);
  }
  return isValidItem;
}

function getNextItemToDisplay(
  historyIds: number[],
  currentIds: number[],
  lastItemId: number,
  lastItemIndex: number,
) {
  const nullValue = { index: -1, itemId: -1 };

  if (currentIds.length === 0) {
    return nullValue;
  }
  const indexInHistoryIds = historyIds.indexOf(lastItemId);

  // find next available item
  for (let i = indexInHistoryIds + 1; i < historyIds.length; ++i) {
    const itemId = historyIds[i];
    const indexInCurrentIds = currentIds.indexOf(itemId);
    if (indexInCurrentIds !== -1) {
      return {
        itemId,
        index: lastItemIndex + (indexInCurrentIds - indexInHistoryIds),
      };
    }
  }

  // find previous available item
  for (let i = indexInHistoryIds - 1; i >= 0; --i) {
    const itemId = historyIds[i];
    const indexInCurrentIds = currentIds.indexOf(itemId);
    if (indexInCurrentIds !== -1) {
      return {
        itemId,
        index: lastItemIndex + (i - indexInHistoryIds),
      };
    }
  }

  return nullValue;
}

export {
  getTypeId,
  isExpectedItemOfThisGroup,
  getFilterFunc,
  getNextItemToDisplay,
};
