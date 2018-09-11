/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-03 18:48:39
* Copyright © RingCentral. All rights reserved.
*/
import { observable } from 'mobx';
import _ from 'lodash';
import BasePresenter from '@/store/base/BasePresenter';
import { GroupService, AccountService } from 'sdk/service';
import { Person, Profile } from 'sdk/models';
import { ACCOUNT_USER_ID } from 'sdk/dao';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import ProfileModel from '@/store/models/Profile';
import { ENTITY_NAME } from '@/store';

enum ConversationTypes {
  TEAM,
  NORMAL_GROUP,
  ME,
  SMS,
  NORMAL_ONE_TO_ONE,
}

class ConversationPageHeaderPresenter extends BasePresenter {
  @observable
  userId: number | null;
  @observable
  groupId: number;
  groupService: GroupService;
  accountService: AccountService;

  constructor() {
    super();
    this.groupService = GroupService.getInstance();
    this.accountService = AccountService.getInstance();
    this.userId = this.accountService.getCurrentUserId();

    this.subscribeNotification(ACCOUNT_USER_ID, ({ type, payload }: { type: string, payload: string }) => {
      if (type === 'put') {
        this.userId = Number(payload);
      }
    });
  }

  getConversationType(group: GroupModel) {
    const { isTeam, members } = group;
    if (isTeam) {
      return ConversationTypes.TEAM;
    }

    if (members && members.length === 1 && members[0] === this.userId) {
      return ConversationTypes.ME;
    }

    if (members && members.length === 2) {
      const otherMember = this.getOtherMember(group);
      if (otherMember && otherMember.isPseudoUser) {
        return ConversationTypes.SMS;
      }
      return ConversationTypes.NORMAL_ONE_TO_ONE;
    }

    return ConversationTypes.NORMAL_GROUP;
  }

  getOtherMember(group: GroupModel) {
    const { members } = group;
    if (members && members.length === 2) {
      const otherMemberId = _.difference(members, [this.userId])[0];
      if (!otherMemberId) {
        return null;
      }
      return this.getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, otherMemberId);
    }
    return null;
  }

  groupIsInFavorites(group: GroupModel) {
    const favoriteGroups = this.getSingleEntity<Profile, ProfileModel>(ENTITY_NAME.PROFILE, 'favoriteGroupIds') || [];
    console.log(favoriteGroups);
    return favoriteGroups.indexOf(group.id) >= 0;
  }
}

export { ConversationPageHeaderPresenter, ConversationTypes };
export default ConversationPageHeaderPresenter;
