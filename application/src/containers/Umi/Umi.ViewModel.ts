/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import _ from 'lodash';

import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { UmiProps, UmiViewProps } from './types';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import storeManager, { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

class UmiViewModel extends StoreViewModel<UmiProps> implements UmiViewProps {
  constructor(props: UmiProps) {
    super(props);

    if (props.global) {
      this.autorun(() => this.updateAppUmi());
    }
  }

  @computed
  get ids() {
    return this.props.ids;
  }

  @computed
  private get _umiObj() {
    const groupIds = this.ids;
    const groupStates = _.map(groupIds, (groupId: number) => {
      return getEntity(ENTITY_NAME.GROUP_STATE, groupId) as GroupStateModel;
    });
    const important = _(groupStates).some((groupState: GroupStateModel) => {
      return !!groupState.unreadMentionsCount;
    });
    const unreadCount = _(groupStates).sumBy((groupState: GroupStateModel) => {
      const group: GroupModel = getEntity(ENTITY_NAME.GROUP, groupState.id);
      const umiCount = group.isTeam
        ? groupState.unreadMentionsCount
        : groupState.unreadCount;
      return umiCount || 0;
    });
    return {
      unreadCount,
      important,
    };
  }

  updateAppUmi() {
    storeManager.getGlobalStore().set(GLOBAL_KEYS.APP_UMI, this.unreadCount);
  }

  @computed
  get unreadCount() {
    return this._umiObj.unreadCount;
  }

  @computed
  get important() {
    return this._umiObj.important;
  }
}
export { UmiViewModel };
