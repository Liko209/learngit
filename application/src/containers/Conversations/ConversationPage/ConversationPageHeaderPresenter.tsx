/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-03 18:48:39
* Copyright © RingCentral. All rights reserved.
*/
import { observable } from 'mobx';
import _ from 'lodash';
import BasePresenter from '@/store/base/BasePresenter';
import { service, dao } from 'sdk';
import { GroupService as IGroupService, AccountService as IAccountService } from 'sdk/service';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { Group, Person, Profile } from 'sdk/models';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import ProfileModel from '@/store/models/Profile';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';
const { GroupService, AccountService } = service;
const { ACCOUNT_USER_ID } = dao;

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
  groupService: IGroupService;
  accountService: IAccountService;
  groupStore: MultiEntityMapStore<Group, GroupModel>;
  personStore: MultiEntityMapStore<Person, PersonModel>;
  profileStore: SingleEntityMapStore<Profile, ProfileModel>;

  constructor() {
    super();
    this.groupService = GroupService.getInstance();
    this.accountService = AccountService.getInstance();
    this.groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP) as MultiEntityMapStore<Group, GroupModel>;
    this.personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON) as MultiEntityMapStore<Person, PersonModel>;
    this.profileStore = storeManager.getEntityMapStore(ENTITY_NAME.PROFILE) as SingleEntityMapStore<Profile, ProfileModel>;
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
      return this.personStore.get(otherMemberId);
    }
    return null;
  }

  groupIsInFavorites(group: GroupModel) {
    const favoriteGroups = this.profileStore.get('favoriteGroupIds') || [];
    return favoriteGroups.indexOf(group.id) >= 0;
  }
}

export { ConversationPageHeaderPresenter, ConversationTypes };
export default ConversationPageHeaderPresenter;
