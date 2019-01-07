/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../../dao';
import ItemDao from '../../../dao/item';
import { ENTITY } from '../../../service/eventKey';
import { transform, baseHandleData } from '../../../service/utils';
import { Item } from '../entity';
import { Raw } from '../../../framework/model';
import { IItemService } from './IItemService';

const buildItemDataHandler = (itemService: IItemService) => {
  return async (items: Raw<Item>[]) => {
    if (items.length === 0) {
      return;
    }
    const transformedData = items.map(item => transform<Item>(item));
    const itemDao = daoManager.getDao(ItemDao);
    // handle deactivated data and normal data
    itemService.handleSanitizedItems(transformedData);
    return baseHandleData({
      data: transformedData,
      dao: itemDao,
      eventKey: ENTITY.ITEM,
    });
  };
};

const extractFileNameAndType = (storagePath: string) => {
  const options = {
    name: '',
    type: '',
  };
  if (storagePath) {
    const arr = storagePath.split('/');
    if (arr && arr.length > 0) {
      const name = arr[arr.length - 1];
      options.name = name;

      const seArr = name.split('.');
      options.type = seArr[seArr.length - 1];
    }
  }
  return options;
};

export { extractFileNameAndType };
export default buildItemDataHandler;
