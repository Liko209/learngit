/*
 * @Author: Paynter Chen
 * @Date: 2019-05-15 17:28:32
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem } from './types';
import { IHealthStatusItem } from 'sdk/types';
import _ from 'lodash';
import { logManager, BuildUtils } from 'foundation';
import { toText } from 'sdk/utils';

const LOG_TAG = '[HealthStatusItemProvider]';

export class HealthStatusItemProvider implements IZipItemProvider {
  private _items: IHealthStatusItem[] = [];

  constructor() {}

  registerHealthStatusItem = (item: IHealthStatusItem) => {
    if (
      _.findIndex(
        this._items,
        (it: IHealthStatusItem) => it.getName() === item.getName(),
      ) > -1
    ) {
      const warnText = `HealthStatusItem name is duplicate: ${item.getName()}`;
      logManager.getLogger(LOG_TAG).warn(warnText);
      if (
        !BuildUtils.isProductionBuild() &&
        !BuildUtils.isPublicBuild() &&
        process.env.NODE_ENV !== 'test'
      ) {
        throw new Error(warnText);
      }
    }
    this._items.push(item);
  }

  unRegisterHealthStatusItem = (item: IHealthStatusItem | string) => {
    if (_.isString(item)) {
      _.remove(this._items, it => {
        return it.getName() === item;
      });
    } else {
      _.remove(this._items, it => {
        return it === item;
      });
    }
  }

  getZipItems = async () => {
    const logContents: string[] = [];
    for (let index = 0; index < this._items.length; index++) {
      const item = this._items[index];
      const status = await item.getStatus();
      logContents.push(`----- ${item.getName()} -----\n\n${toText(status)}\n`);
    }
    return [
      {
        type: '.txt',
        name: 'HealthStatus',
        content: logContents.join('\n'),
      } as ZipItem,
    ];
  }
}
