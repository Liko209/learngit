/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:15:26
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from './notificationCenter';
import { daoManager, DeactivatedDao } from '../dao';
import { mainLogger } from 'foundation';
import _ from 'lodash';
import { IdModel } from '../framework/model';
import { ControllerUtils } from '../framework/controller/ControllerUtils';

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
  /(MSIE|Trident|Edge)/.test(navigator.userAgent);

const transform = <T extends { id: number }>(item: any): T => {
  if (isObject(item)) {
    /* eslint-disable no-underscore-dangle, no-param-reassign */
    item.id = item.id || item._id || 0;
    delete item._id;
    /* eslint-enable no-underscore-dangle, no-param-reassign */
  }
  return item as T;
};

const transformAll = <T extends { id: number }>(target: any): T[] => {
  const arr = Array.isArray(target) ? target : [target];
  return arr.map(obj => transform(obj));
};

const baseHandleData = async (
  { data, dao, eventKey, noSavingToDB, source }: any,
  filterFunc?: (data: IdModel[]) => { eventKey: string; entities: IdModel[] }[],
) => {
  // ** NOTICE **
  // this function only filter normal data and deactivated data and emit event for them
  // if you have more complex logic, should not use it
  // TODO if is a team, should consider archived case, do delete emit, but no delete it in dao
  try {
    // delete deactivatedData
    const deactivatedData = data.filter(
      (item: any) => item.deactivated === true,
    );
    if (deactivatedData.length > 0) {
      await daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
      await dao.bulkDelete(deactivatedData.map((item: any) => item.id));
    }
    // put normalData
    const normalData = data.filter((item: any) => item.deactivated !== true);
    if (normalData.length > 0) {
      if (!noSavingToDB) {
        await dao.bulkPut(normalData);
      }
    }

    if (ControllerUtils.shouldEmitNotification(source)) {
      if (filterFunc) {
        const notifications = filterFunc(data);
        notifications.forEach(
          (notification: { eventKey: string; entities: IdModel[] }) => {
            notificationCenter.emitEntityUpdate(
              notification.eventKey,
              notification.entities,
            );
          },
        );
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

export { transform, transformAll, baseHandleData, isFunction, isIEOrEdge };
