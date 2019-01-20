/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:14:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ImageFileExtensions } from './ImageFileExtensions';
import { GlipTypeUtil, TypeDictionary, TimeUtils } from '../../../utils';
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

  static eventFilter<
    T extends { id: number; group_ids: number[]; effective_end: number }
  >(groupId: number) {
    return (event: T) => {
      let result = false;
      do {
        if (!ItemUtils.isValidItem(groupId, event)) {
          break;
        }

        if (
          GlipTypeUtil.extractTypeId(event.id) !== TypeDictionary.TYPE_ID_EVENT
        ) {
          break;
        }

        if (
          event.effective_end < Number.MAX_SAFE_INTEGER &&
          !TimeUtils.compareDate(event.effective_end, Date.now())
        ) {
          break;
        }

        result = true;
      } while (false);

      return result;
    };
  }
}

export { ItemUtils };
