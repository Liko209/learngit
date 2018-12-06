/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, action } from 'mobx';
import { Group, Person } from 'sdk/models';
import { service } from 'sdk';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import { ENTITY_NAME } from '@/store';
import { AbstractViewModel } from '@/base';
import { CONVERSATION_TYPES } from '@/constants';
import { t } from 'i18next';
import _ from 'lodash';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
const { GroupService } = service;

class HeaderViewModel extends AbstractViewModel {
  @observable
  private _id: number;

  private _groupService: service.GroupService = GroupService.getInstance();

  @action
  onReceiveProps({ id }: { id: number }) {
    this._id = id;
  }

  @computed
  get title() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    let title = group.displayName;
    if (group.type === CONVERSATION_TYPES.SMS) {
      title += ` (${t('text')})`;
    }
    return title;
  }

  @computed
  get customStatus() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    if (group.isTeam) {
      return null;
    }
    if (group.members && group.members.length <= 2) {
      let userId;
      if (group.members.length === 1) {
        userId = group.members[0];
      } else {
        userId = _.difference(
          group.members,
          [].concat(getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID)),
        )[0];
      }
      const user = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, userId);
      return user.awayStatus || null;
    }
    return null;
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

    // hide not implemented button
    // if (
    //   this.type === CONVERSATION_TYPES.TEAM ||
    //   this.type === CONVERSATION_TYPES.NORMAL_GROUP
    // ) {
    //   actions.push(
    //     factory('audio conference', 'device_hub', 'startConferenceCall'),
    //   );
    // }
    // if (
    //   this.type === CONVERSATION_TYPES.SMS ||
    //   this.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE
    // ) {
    //   actions.push(factory('call', 'local_phone', 'startVoiceCall'));
    // }

    if (this.type !== CONVERSATION_TYPES.ME) {
      actions.push(factory('meeting', 'videocam', 'startVideoCall'));
      // actions.push(factory('add member', 'person_add', 'addMembers'));
    }
    return actions;
  }

  onFavoriteButtonHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ): Promise<ServiceCommonErrorType> => {
    return this._groupService.markGroupAsFavorite(this._id, checked);
  }
}

export { HeaderViewModel };
