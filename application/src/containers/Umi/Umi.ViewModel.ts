/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, autorun, action } from 'mobx';

import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getSingleEntity } from '@/store/utils';
import { MyState, Profile } from 'sdk/models';
import MyStateModel from '@/store/models/MyState';
import { UmiProps, UmiViewProps } from './types';
import { ENTITY_NAME } from '@/store';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';

import _ from 'lodash';

class UmiViewModel extends StoreViewModel implements UmiViewProps {
  @observable
  ids: number[];

  @observable
  unreadCount: number;

  @observable
  umiVariant: 'count' | 'dot' | 'auto';

  @observable
  umiHint?: boolean;

  @observable
  important?: boolean;

  constructor() {
    super();
  }

  // @action
  // onReceiveProps(props: UmiProps) {
  //   if (this.ids !== props.ids) {
  //     this.ids = props.ids;
  //   }
  //   // this.autorun(() => {
  //   //   this.calculateUmi();
  //   // });
  // }

  calculateUmi() {
    const groupIds = this.ids || this._getAllGroupIds();
    const lastGroupId = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupStates = _.map(groupIds, (groupId: number) => {
      return getEntity(ENTITY_NAME.GROUP_STATE, groupId) as GroupStateModel;
    });

    this.unreadCount = _.sumBy(groupStates, (groupState: GroupStateModel) => {
      const isCurrentGroup = lastGroupId && lastGroupId === groupState.id;
      const group = getEntity(ENTITY_NAME.GROUP, groupState.id) as GroupModel;
      const unreadCount = isCurrentGroup
        ? 0
        : (!group.isTeam && (groupState.unreadCount || 0)) ||
          (groupState.unreadMentionsCount || 0);
      this.important = this.important || !!groupState.unreadMentionsCount;
      return unreadCount;
    });
    this.umiVariant = 'count';
  }

  private _getAllGroupIds(): any {
    throw new Error('Method not implemented.');
  }
}
export { UmiViewModel };
