/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, action } from 'mobx';
import { Group } from 'sdk/models';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { AbstractViewModel } from '@/base';
import { CONVERSATION_TYPES } from '@/constants';

class HeaderViewModel extends AbstractViewModel {
  @observable
  private _id: number;

  @action
  onReceiveProps({ id }: { id: number }) {
    this._id = id;
  }

  @computed
  get title() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.displayName;
  }

  @computed
  get type() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.type;
  }

  @computed
  get isFavorite() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.isFavorite;
  }

  @computed
  get isPrivate() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.privacy === 'private';
  }

  @computed
  get actions() {
    const actions = [];
    const factory = (name: string, iconName: string, tooltip: string) => ({
      name,
      iconName,
      tooltip,
    });
    if (
      this.type === CONVERSATION_TYPES.TEAM ||
      this.type === CONVERSATION_TYPES.NORMAL_GROUP
    ) {
      actions.push(
        factory('audio conference', 'device_hub', 'startConferenceCall'),
      );
    }
    if (
      this.type === CONVERSATION_TYPES.SMS ||
      this.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE
    ) {
      actions.push(factory('call', 'local_phone', 'startVoiceCall'));
    }

    if (this.type !== CONVERSATION_TYPES.ME) {
      actions.push(factory('meeting', 'videocam', 'startVideoCall'));
      actions.push(factory('add member', 'person_add', 'addMembers'));
    }
    return actions;
  }
}

export { HeaderViewModel };
