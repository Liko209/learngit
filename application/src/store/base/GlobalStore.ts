/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:28:52
 * Copyright © RingCentral. All rights reserved.
 */
import { action, get, set, remove, observable } from 'mobx';

import BaseStore from './BaseStore';
import { ENTITY_NAME, GLOBAL_KEYS } from '../constants';
import { GLOBAL_VALUES } from '../config';
import { SERVICE, notificationCenter } from 'sdk/service';
import { SectionUnread, GROUP_SECTION_TYPE } from 'sdk/module/state';

export default class GlobalStore extends BaseStore {
  private _data = observable.object<typeof GLOBAL_VALUES>(
    GLOBAL_VALUES,
    {},
    { deep: false },
  );

  constructor() {
    super(ENTITY_NAME.GLOBAL);
    notificationCenter.on(SERVICE.TOTAL_UNREAD, this.setTotalUnread);
  }

  setTotalUnread = (sectionUnreadArray: SectionUnread[]) => {
    sectionUnreadArray.forEach((sectionUnread: SectionUnread) => {
      switch (sectionUnread.section) {
        case GROUP_SECTION_TYPE.ALL: {
          this.set(GLOBAL_KEYS.TOTAL_UNREAD, sectionUnread);
          break;
        }
        case GROUP_SECTION_TYPE.FAVORITE: {
          this.set(GLOBAL_KEYS.FAVORITE_UNREAD, sectionUnread);
          break;
        }
        case GROUP_SECTION_TYPE.DIRECT_MESSAGE: {
          this.set(GLOBAL_KEYS.DIRECT_MESSAGE_UNREAD, sectionUnread);
          break;
        }
        case GROUP_SECTION_TYPE.TEAM: {
          this.set(GLOBAL_KEYS.TEAM_UNREAD, sectionUnread);
          break;
        }
      }
    });
  }

  @action
  set<K extends keyof typeof GLOBAL_VALUES>(
    key: K,
    value: (typeof GLOBAL_VALUES)[K],
  ) {
    set(this._data, key, value);
  }

  @action
  batchSet<K extends keyof typeof GLOBAL_VALUES>(
    data: Partial<typeof GLOBAL_VALUES>,
  ) {
    Object.keys(data).forEach((key: keyof typeof GLOBAL_VALUES) => {
      this.set(key, data[key] as typeof GLOBAL_VALUES[K]);
    });
  }

  @action
  remove(key: keyof typeof GLOBAL_VALUES) {
    remove(this._data, key);
  }

  @action
  batchRemove(keys: any[]) {
    keys.forEach((key: keyof typeof GLOBAL_VALUES) => {
      this.remove(key);
    });
  }

  get(key: keyof typeof GLOBAL_VALUES) {
    return get(this._data, key);
  }
}
