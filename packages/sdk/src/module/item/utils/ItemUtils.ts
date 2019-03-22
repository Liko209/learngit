/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-12 23:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { FileItemUtils } from '../module/file/utils';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { SanitizedEventItem } from '../module/event/entity';
import { EventUtils } from '../module/event/utils';
import moment from 'moment';

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

  static eventFilter<T extends SanitizedEventItem>(groupId: number) {
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

        const effectEnd = EventUtils.getEffectiveEnd(event);
        if (effectEnd < Number.MAX_SAFE_INTEGER) {
          const effectEnd = EventUtils.getEffectiveEnd(event);
          const endDate = new Date(effectEnd).toLocaleDateString();
          const today = new Date(Date.now()).toLocaleDateString();

          if (!moment(endDate).isSameOrAfter(today)) {
            break;
          }
        }

        result = true;
      } while (false);

      return result;
    };
  }
}

export { ItemUtils };
