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
import { SectionUnread, UMI_SECTION_TYPE } from 'sdk/module/state';

export default class GlobalStore extends BaseStore {
  private _data = observable.object<typeof GLOBAL_VALUES>(
    GLOBAL_VALUES,
    {},
    { deep: false },
  );
  private _eventKeyMap: Map<UMI_SECTION_TYPE, GLOBAL_KEYS>;

  constructor() {
    super(ENTITY_NAME.GLOBAL);
    this._eventKeyMap = new Map<UMI_SECTION_TYPE, GLOBAL_KEYS>();
    this._eventKeyMap.set(UMI_SECTION_TYPE.ALL, GLOBAL_KEYS.TOTAL_UNREAD);
    this._eventKeyMap.set(
      UMI_SECTION_TYPE.FAVORITE,
      GLOBAL_KEYS.FAVORITE_UNREAD,
    );
    this._eventKeyMap.set(
      UMI_SECTION_TYPE.DIRECT_MESSAGE,
      GLOBAL_KEYS.DIRECT_MESSAGE_UNREAD,
    );
    this._eventKeyMap.set(UMI_SECTION_TYPE.TEAM, GLOBAL_KEYS.TEAM_UNREAD);
    notificationCenter.on(SERVICE.TOTAL_UNREAD, this.setTotalUnread);
  }

  setTotalUnread = (totalUnreadMap: Map<UMI_SECTION_TYPE, SectionUnread>) => {
    totalUnreadMap.forEach((sectionUnread: SectionUnread) => {
      const eventKey = this._eventKeyMap.get(sectionUnread.section);
      if (eventKey) {
        this.set(eventKey, {
          unreadCount: sectionUnread.unreadCount,
          mentionCount: sectionUnread.mentionCount,
        });
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
