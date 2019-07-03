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
const DATE_FORMAT = 'YYYY-MM-DD';
const { TYPE_ID_TASK, TYPE_ID_FILE, TYPE_ID_EVENT } = TypeDictionary;

type ItemLike = { id: number; group_ids: number[] };
type TaskLike = ItemLike & { complete: boolean };
type FileLike = ItemLike & { type: string };
type EventLike = SanitizedEventItem;

class ItemUtils {
  static taskFilter<T extends TaskLike>(groupId: number, showAll: boolean) {
    return (task: T) =>
      this._isValidExpectedType(groupId, task, TYPE_ID_TASK) &&
      (showAll || !task.complete);
  }

  static fileFilter<T extends FileLike>(groupId: number) {
    return (file: T) =>
      this._isValidExpectedType(groupId, file, TYPE_ID_FILE) &&
      !this._isPic(file);
  }

  static imageFilter<T extends FileLike>(groupId: number) {
    return (file: T) =>
      this._isValidExpectedType(groupId, file, TYPE_ID_FILE) &&
      this._isPic(file);
  }

  static eventFilter<T extends EventLike>(groupId: number) {
    return (event: T) =>
      this._isValidExpectedType(groupId, event, TYPE_ID_EVENT) &&
      this._isTodayOrAfter(event);
  }

  static isValidItem<T extends ItemLike>(groupId: number, item: T) {
    return item.id > 0 && item.group_ids.includes(groupId);
  }

  private static _isValidExpectedType<T extends ItemLike>(
    groupId: number,
    item: T,
    typeId: number,
  ) {
    return (
      this.isValidItem(groupId, item) &&
      GlipTypeUtil.isExpectedType(item.id, typeId)
    );
  }

  private static _isPic<T extends FileLike>(item: T) {
    return FileItemUtils.isImageItem(item) || FileItemUtils.isGifItem(item);
  }

  private static _isTodayOrAfter<T extends EventLike>(event: T) {
    const effectEnd = EventUtils.getEffectiveEnd(event);
    const endDate = moment(effectEnd)
      .local()
      .format(DATE_FORMAT);
    const today = moment(Date.now())
      .local()
      .format(DATE_FORMAT);
    return (
      effectEnd >= Number.MAX_SAFE_INTEGER ||
      moment(endDate).isSameOrAfter(today)
    );
  }
}

export { ItemUtils };
