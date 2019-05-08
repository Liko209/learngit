/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-24 15:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemUtils, ITEM_SORT_KEYS } from 'sdk/module/item';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil } from 'sdk/utils';
import { TAB_CONFIG } from './config';
import { RightRailItemTypeIdMap, RIGHT_RAIL_ITEM_TYPE } from './constants';

function getFilterFunc(groupId: number, type: RIGHT_RAIL_ITEM_TYPE) {
  switch (type) {
    case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
      return ItemUtils.imageFilter(groupId);
    case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
      return ItemUtils.fileFilter(groupId);
    case RIGHT_RAIL_ITEM_TYPE.EVENTS:
      return ItemUtils.eventFilter(groupId);
    case RIGHT_RAIL_ITEM_TYPE.TASKS:
      return ItemUtils.taskFilter(groupId, false);
    default:
      return undefined;
  }
}

function getSort(type: RIGHT_RAIL_ITEM_TYPE) {
  return {
    sortKey: ITEM_SORT_KEYS.CREATE_TIME,
    desc: false,
    ...getTabConfig(type).sort,
  };
}

function getTypeId(type: RIGHT_RAIL_ITEM_TYPE) {
  return RightRailItemTypeIdMap[type];
}

function isExpectedItemOfThisGroup(
  groupId: number,
  type: RIGHT_RAIL_ITEM_TYPE,
  item: Item,
) {
  let isValidItem = !item.deactivated && item.post_ids.length > 0;
  switch (type) {
    case RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES:
    case RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES:
    case RIGHT_RAIL_ITEM_TYPE.EVENTS:
    case RIGHT_RAIL_ITEM_TYPE.TASKS:
      isValidItem =
        isValidItem &&
        (getFilterFunc(groupId, type) as (valid: Item) => boolean)(item);
      break;

    case RIGHT_RAIL_ITEM_TYPE.NOTES:
    case RIGHT_RAIL_ITEM_TYPE.LINKS:
    case RIGHT_RAIL_ITEM_TYPE.INTEGRATIONS:
    default:
      isValidItem =
        isValidItem &&
        GlipTypeUtil.extractTypeId(item.id) === getTypeId(type) &&
        ItemUtils.isValidItem(groupId, item);
      break;
  }
  return isValidItem;
}

function getTabConfig(type: RIGHT_RAIL_ITEM_TYPE) {
  const tabConfig = TAB_CONFIG.find(config => config.type === type);
  if (!tabConfig) {
    throw new Error(`getTabConfig() Error: can not find config for ${type}`);
  }
  return tabConfig;
}

export {
  getSort,
  getTabConfig,
  getTypeId,
  isExpectedItemOfThisGroup,
  getFilterFunc,
};
