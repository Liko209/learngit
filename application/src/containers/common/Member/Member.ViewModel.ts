/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-12 13:25:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { StoreViewModel } from '@/store/ViewModel';
import { MemberProps, MemberViewProps } from './types';
import { CONVERSATION_TYPES } from '@/constants';

class MemberViewModel extends StoreViewModel<MemberProps>
  implements MemberViewProps {
  private _showTypes = [
    CONVERSATION_TYPES.TEAM,
    CONVERSATION_TYPES.NORMAL_GROUP,
  ];

  @computed
  get groupId() {
    return this.props.id;
  }

  @computed
  get isTeam() {
    return this._group.isTeam || false;
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get membersCount() {
    const { members } = this._group;

    return members ? members.length : 0;
  }

  @computed
  get showMembersCount() {
    return this._showTypes.includes(this._group.type);
  }
}

export { MemberViewModel };
