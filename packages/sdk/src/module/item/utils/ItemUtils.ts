/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:14:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ImageFileExtensions } from './ImageFileExtensions';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { Item, SanitizedItem } from '../module/base/entity';

class ItemUtils {
  static isValidItem<T extends { id: number; group_ids: number[] }>(
    groupId: number,
    item: T,
  ) {
    return item.id > 0 && item.group_ids.includes(groupId);
  }

  static isImageItem<T extends { type: string }>(file: T) {
    const type = file.type.toLocaleLowerCase();
    return (
      ImageFileExtensions.includes(type) ||
      type.indexOf('image') !== -1 ||
      type.indexOf('giphy') !== -1
    );
  }

  static fileFilter<
    T extends { id: number; group_ids: number[]; type: string }
  >(groupId: number, showImage: boolean) {
    return (file: T): boolean => {
      let result = false;
      do {
        if (!ItemUtils.isValidItem(groupId, file)) {
          break;
        }

        if (
          GlipTypeUtil.extractTypeId(file.id) !== TypeDictionary.TYPE_ID_FILE
        ) {
          break;
        }
        // show images only or non image file only
        const isExpectedType = showImage
          ? ItemUtils.isImageItem(file)
          : !ItemUtils.isImageItem(file);
        if (!isExpectedType) {
          break;
        }
        result = true;
      } while (false);

      return result;
    };
  }

  static toSanitizedItem(item: Item) {
    return {
      id: item.id,
      group_ids: item.group_ids,
      created_at: item.created_at,
    } as SanitizedItem;
  }
}

export { ItemUtils };
