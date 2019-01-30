/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { GroupService } from 'sdk/service';
import { StateService } from 'sdk/module/state';
import { Group } from 'sdk/module/group/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import StoreViewModel from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { ConversationPageProps } from './types';
import _ from 'lodash';
import history from '@/history';

class ConversationPageViewModel extends StoreViewModel<ConversationPageProps> {
  private _groupService: GroupService = GroupService.getInstance();
  private _stateService: StateService = StateService.getInstance();

  constructor(props: ConversationPageProps) {
    super(props);
    this.reaction(
      () => this.props.groupId,
      async (groupId: number) => {
        const group = await this._groupService.getById(groupId);
        if (!group) {
          history.replace('/messages/loading', {
            id: groupId,
            error: true,
          });
          return;
        }
        this._readGroup(groupId);
      },
    );
  }

  private _throttledUpdateLastGroup = _.wrap(
    _.throttle(
      (groupId: number) => {
        this._stateService.updateLastGroup(groupId);
      },
      3000,
      { trailing: true, leading: false },
    ),
    (func, groupId: number) => {
      return func(groupId);
    },
  );

  @computed
  private get _group() {
    return this.props.groupId
      ? getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId)
      : ({} as GroupModel);
  }

  @computed
  get canPost() {
    return this._group.canPost;
  }

  private async _readGroup(groupId: number) {
    this._throttledUpdateLastGroup(groupId);
  }
}

export { ConversationPageViewModel };
