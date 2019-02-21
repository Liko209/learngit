/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:14:52
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemUtils } from '../module/file/utils';
import { GlipTypeUtil, TypeDictionary, TimeUtils } from '../../../utils';

class ItemUtils {
  static isValidItem<T extends { id: number; group_ids: number[] }>(
    groupId: number,
    item: T,
  ) {
    return item.id > 0 && item.group_ids.includes(groupId);
  }

  static taskFilter<
    T extends { id: number; group_ids: number[]; complete: boolean }
  >(groupId: number, showCompleted: boolean) {
    return (task: T) => {
      let result = false;
      do {
        if (!ItemUtils.isValidItem(groupId, task)) {
          result = false;
        }

        if (
          GlipTypeUtil.extractTypeId(task.id) !== TypeDictionary.TYPE_ID_TASK
        ) {
          break;
        }

        result = showCompleted || !task.complete;
      } while (false);
      return result;
    };
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
        const isPic =
          FileItemUtils.isImageItem(file) || FileItemUtils.isGifItem(file);
        const isExpectedType = showImage ? isPic : !isPic;
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
