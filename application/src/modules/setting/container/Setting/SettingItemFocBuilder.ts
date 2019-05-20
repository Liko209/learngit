/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { SettingService } from 'sdk/module/setting/service';
import { UserSettingEntity } from 'sdk/module/setting/entity';
import { ENTITY } from 'sdk/service';
import _ from 'lodash';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { SETTING_ITEM } from '../constants';

const settingService = ServiceLoader.getInstance<SettingService>(
  ServiceConfig.SETTING_SERVICE,
);

class SettingItemDataProvider
  implements IFetchSortableDataProvider<UserSettingEntity> {
  constructor(private _leftRailId: number) {}

  async fetchData(): Promise<{
    data: UserSettingEntity[];
    hasMore: boolean;
  }> {
    const result = await settingService.getSettingsByParentId(this._leftRailId);
    return { data: result, hasMore: false };
  }
}

class SettingLeftRailDataProvider
  implements IFetchSortableDataProvider<UserSettingEntity> {
  async fetchData(): Promise<{
    data: UserSettingEntity[];
    hasMore: boolean;
  }> {
    const result = await settingService.getModuleSettings();
    return { data: result, hasMore: false };
  }
}

class SettingItemFocBuilder {
  _transformFunc = (item: UserSettingEntity) => {
    return {
      id: item.id,
      sortValue: item.weight,
    };
  }

  baseConfig = {
    entityName: ENTITY_NAME.USER_SETTING,
    transformFunc: this._transformFunc,
    eventName: ENTITY.USER_SETTING,
    hasMoreDown: true,
    hasMoreUp: true,
  };

  buildSettingItemFoc = (id: number) => {
    const isMatchFunc = (item: UserSettingEntity) => {
      if (
        _.inRange(id, SETTING_ITEM[id].range[0], SETTING_ITEM[id].range[1]) &&
        item.parentModelId
      ) {
        return true;
      }
      return false;
    };

    const dataProvider = new SettingItemDataProvider(id);

    const listHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      ...this.baseConfig,
    });

    return listHandler;
  }

  buildLeftRailFoc = () => {
    const isMatchFunc = (item: UserSettingEntity) =>
      item.parentModelId ? false : true;

    const dataProvider = new SettingLeftRailDataProvider();

    const listHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc,
      ...this.baseConfig,
    });

    return listHandler;
  }
}

export {
  SettingLeftRailDataProvider,
  SettingItemDataProvider,
  SettingItemFocBuilder,
};
