/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, untracked } from 'mobx';
import _ from 'lodash';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { UmiProps, UmiViewProps } from './types';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { AppStore } from '@/modules/app/store';

class UmiViewModel extends StoreViewModel<UmiProps> implements UmiViewProps {
  private _appStore = container.get(AppStore);

  constructor(props: UmiProps) {
    super(props);

    if (props.global) {
      this.autorun(() => this.updateAppUmi());
    }
  }

  @computed
  private get _umiObj() {
    const groupIds = this.props.ids;
    const groupStates = _.map(groupIds, (groupId: number) => {
      return getEntity(ENTITY_NAME.GROUP_STATE, groupId) as GroupStateModel;
    });
    const important = _(groupStates).some((groupState: GroupStateModel) => {
      return !!groupState.unreadMentionsCount;
    });
    const unreadCount = _(groupStates).sumBy((groupState: GroupStateModel) => {
      const group: GroupModel = getEntity(ENTITY_NAME.GROUP, groupState.id);
      let umiCount = group.isTeam
        ? groupState.unreadMentionsCount
        : groupState.unreadCount;
      untracked(() => {
        const currentConversation = getGlobalValue(
          GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        );
        const shouldShowUMI = getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI);
        if (group.id === currentConversation && !shouldShowUMI) {
          umiCount = 0;
        }
      });
      return umiCount || 0;
    });
    return {
      unreadCount,
      important,
    };
  }

  updateAppUmi() {
    this._appStore.setUmi(this.unreadCount);
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
