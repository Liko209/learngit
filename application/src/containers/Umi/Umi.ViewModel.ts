/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import _ from 'lodash';

import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getSingleEntity } from '@/store/utils';
import { MyState } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import { UmiProps, UmiViewProps } from './types';
import { ENTITY_NAME } from '@/store';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';

class UmiViewModel extends StoreViewModel implements UmiViewProps {
  constructor() {
    super();
    this.autorun(() => {
      this.appUmi();
    });
  }
  private appName = process.env.APP_NAME || '';
  @observable
  ids: number[] = [];

  @observable
  global?: string;
  @computed
  private get _umiObj() {
    const groupIds = this.ids;
    const lastGroupId = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupStates = _.map(groupIds, (groupId: number) => {
      return getEntity(ENTITY_NAME.GROUP_STATE, groupId) as GroupStateModel;
    });
    let important = false;
    const unreadCount = _.sumBy(groupStates, (groupState: GroupStateModel) => {
      const isCurrentGroup = lastGroupId && lastGroupId === groupState.id;
      const group = getEntity(ENTITY_NAME.GROUP, groupState.id) as GroupModel;
      const unreadCount = isCurrentGroup
        ? 0
        : (!group.isTeam && (groupState.unreadCount || 0)) ||
          (groupState.unreadMentionsCount || 0);
      important = important || !!groupState.unreadMentionsCount;
      return unreadCount;
    });
    return {
      unreadCount,
      important,
    };
  }

  appUmi() {
    if (this.global) {
      const appUmi = this.unreadCount;
      if (appUmi) {
        document.title = `(${appUmi}) ${this.appName}`;
        if (window.jupiterElectron && window.jupiterElectron.setBadgeCount) {
          _.debounce(window.jupiterElectron.setBadgeCount(appUmi));
        }
      } else {
        document.title = this.appName;
      }
    }
  }

  @computed
  get unreadCount() {
    return this._umiObj.unreadCount;
  }

  @computed
  get important() {
    return this._umiObj.important;
  }

  onReceiveProps(props: UmiProps) {
    if (!_.isEqual([...this.ids], props.ids)) {
      this.ids = props.ids;
    }
    this.global = props.global;
  }
}
export { UmiViewModel };
