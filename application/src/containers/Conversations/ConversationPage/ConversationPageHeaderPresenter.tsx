/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-03 18:48:39
* Copyright © RingCentral. All rights reserved.
*/
import { observable } from 'mobx';
import _ from 'lodash';
import { GroupService, AccountService } from 'sdk/service';

import { Person, Profile, Group } from 'sdk/models';
import { ACCOUNT_USER_ID } from 'sdk/dao';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { getEntity, getSingleEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import ProfileModel from '@/store/models/Profile';
import { ENTITY_NAME } from '@/store';
import { getGroupName } from '@/utils/groupName';
import { TranslationFunction } from 'i18next';

enum ConversationTypes {
  TEAM,
  NORMAL_GROUP,
  ME,
  SMS,
  NORMAL_ONE_TO_ONE,
}

class ConversationPageHeaderPresenter extends BaseNotificationSubscribable {
  @observable
  group: GroupModel;
  @observable
  userId: number | null;
  @observable
  groupId: number;
  groupService: GroupService;
  accountService: AccountService;

  constructor(groupId: number) {
    super();
    this.group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
    this.groupService = GroupService.getInstance();
    this.accountService = AccountService.getInstance();
    this.userId = this.accountService.getCurrentUserId();

    this.subscribeNotification(
      ACCOUNT_USER_ID,
      ({ type, payload }: { type: string; payload: string }) => {
        if (type === 'put') {
          this.userId = Number(payload);
        }
      },
    );
  }

  getGroupName(t: TranslationFunction) {
    const normalGroupName = getGroupName(
      getEntity,
      this.group,
      this.userId || undefined,
    );
    const type = this.getConversationType();
    return normalGroupName + (type === ConversationTypes.SMS ? ` (${t('text')})` : '');
  }

  getConversationType() {
    const { isTeam, members } = this.group;
    if (isTeam) {
      return ConversationTypes.TEAM;
    }

    if (members && members.length === 1 && members[0] === this.userId) {
      return ConversationTypes.ME;
    }

    if (members && members.length === 2) {
      const otherMember = this.getOtherMember();
      if (otherMember && otherMember.isPseudoUser) {
        return ConversationTypes.SMS;
      }
      return ConversationTypes.NORMAL_ONE_TO_ONE;
    }

    return ConversationTypes.NORMAL_GROUP;
  }

  getOtherMember() {
    const { members } = this.group;
    if (members && members.length === 2) {
      const otherMemberId = _.difference(members, [this.userId])[0];
      if (!otherMemberId) {
        return null;
      }
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, otherMemberId);
    }
    return null;
  }

  groupIsInFavorites() {
    const favoriteGroups =
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || [];
    return favoriteGroups.indexOf(this.group.id) >= 0;
  }

  groupIsPrivate() {
    return this.group.privacy === 'private';
  }

  getRightButtons() {
    const buttons = [];
    const type = this.getConversationType();
    const factory = (name: string, iconName: string, tooltip: string) => ({
      name,
      iconName,
      tooltip,
    });
    if (type === ConversationTypes.TEAM || type === ConversationTypes.NORMAL_GROUP) {
      buttons.push(factory('audio conference', 'device_hub', 'startConferenceCall'));
    } else if (type === ConversationTypes.SMS || type === ConversationTypes.NORMAL_ONE_TO_ONE) {
      buttons.push(factory('call', 'local_phone', 'startVoiceCall'));
    }

    if (type !== ConversationTypes.ME) {
      buttons.push(factory('meeting', 'videocam', 'startVideoCall'));
      buttons.push(factory('add member', 'person_add', 'addMembers'));
    }
    return buttons;
  }
}

export { ConversationPageHeaderPresenter, ConversationTypes };
export default ConversationPageHeaderPresenter;
