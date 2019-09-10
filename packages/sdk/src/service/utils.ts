/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:15:26
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from './notificationCenter';
import { daoManager, DeactivatedDao } from '../dao';
import { mainLogger } from 'foundation/log';
import { IdModel } from '../framework/model';
import { shouldEmitNotification } from '../utils/notificationUtils';

const isObject = (value: any) =>
  Object.prototype.toString.call(value) === '[object Object]';
// const isArray = value => Object.prototype.toString.call(value) === '[object Array]';
// const isBoolean = value => Object.prototype.toString.call(value) === '[object Boolean]';
// const isNumber = value => Object.prototype.toString.call(value) === '[object Number]';
// const isString = value => Object.prototype.toString.call(value) === '[object String]';
// const isNull = value => Object.prototype.toString.call(value) === '[object Null]';
// const isUndefined = value => Object.prototype.toString.call(value) === '[object Undefined]';
const isFunction = (value: any) =>
  Object.prototype.toString.call(value) === '[object Function]';
// const isRegExp = value => Object.prototype.toString.call(value) === '[object RegExp]';
const isIEOrEdge =
  typeof navigator !== 'undefined' &&
  /(MSIE|Trident|Edge?)/.test(navigator.userAgent);

const isChrome =
  !isIEOrEdge &&
  /Chrome/.test(navigator.userAgent) &&
  /Google Inc/.test(navigator.vendor);

const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

const transform = <T extends { id: any }>(item: any): T => {
  if (isObject(item)) {
    item.id = item.id || item._id || 0;
    delete item._id;
  }
  return item as T;
};

const transformAll = <T extends { id: number }>(target: any): T[] => {
  const arr = Array.isArray(target) ? target : [target];
  return arr.map(obj => transform(obj));
};

const baseHandleData = async (
  {
    data,
    dao,
    eventKey,
    noSavingToDB,
    source,
    changeMap,
    entitySourceController,
  }: any,
  filterFunc?: (data: IdModel[]) => { eventKey: string; entities: IdModel[] }[],
) => {
  // ** NOTICE **
  // this function only filter normal data and deactivated data and emit event for them
  // if you have more complex logic, should not use it
  // TODO if is a team, should consider archived case, do delete emit, but no delete it in dao
  try {
    if (!data || !data.length) {
      return [];
    }

    const deactivatedData: any[] = [];
    const normalData: any[] = [];
    data.forEach((item: any) => {
      if (item.deactivated) {
        deactivatedData.push(item);
      } else {
        normalData.push(item);
      }
    });

    if (deactivatedData.length > 0) {
      const ids = deactivatedData.map((item: any) => item.id);
      await Promise.all([
        daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData),
        entitySourceController
          ? entitySourceController.bulkDelete(ids)
          : dao.bulkDelete(ids),
      ]);
    }

    if (normalData.length > 0) {
      if (!noSavingToDB) {
        entitySourceController
          ? await entitySourceController.bulkPut(normalData)
          : await dao.bulkPut(normalData);
      }
    }
    if (shouldEmitNotification(source)) {
      if (filterFunc) {
        const notifications = filterFunc(data);
        notifications.forEach(
          (notification: { eventKey: string; entities: IdModel[] }) => {
            if (changeMap) {
              changeMap.set(notification.eventKey, {
                entities: notification.entities,
              });
            } else {
              notificationCenter.emitEntityUpdate(
                notification.eventKey,
                notification.entities,
              );
            }
          },
        );
      } else if (changeMap) {
        changeMap.set(eventKey, { entities: data });
      } else {
        notificationCenter.emitEntityUpdate(eventKey, data);
      }
    }
    return normalData;
  } catch (e) {
    mainLogger.error(`baseHandleData: ${JSON.stringify(e)}`);
    return [];
  }
};

export {
  transform,
  transformAll,
  baseHandleData,
  isFunction,
  isIEOrEdge,
  isChrome,
  isFirefox,
};
