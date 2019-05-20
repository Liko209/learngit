/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 18:22:26
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Group } from 'sdk/module/group/entity';
import { Profile } from 'sdk/module/profile/entity';
import { ENTITY_NAME } from '@/store';
import ProfileModel from '@/store/models/Profile';
import { getEntity, getSingleEntity } from '@/store/utils';
import { compareName } from '../helper';
import { CONVERSATION_TYPES } from '@/constants';
import Base from './Base';
import i18nT from '@/utils/i18nT';
import { TeamPermission, GroupService } from 'sdk/module/group';
import { PERMISSION_ENUM } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

export default class GroupModel extends Base<Group> {
  @observable
  isTeam?: boolean;
  @observable
  setAbbreviation: string;
  @observable
  members: number[] = [];
  @observable
  description?: string;
  @observable
  pinnedPostIds: number[];
  @observable
  privacy?: string;
  @observable
  creatorId: number;
  @observable
  createdAt: number;
  @observable
  guestUserCompanyIds?: number[];
  @observable
  permissions?: TeamPermission;
  @observable
  mostRecentPostId?: number;
  @observable
  deactivated: boolean;
  @observable
  isArchived?: boolean;
  @observable
  convertedToTeam?: { team_id?: number; created?: number };
  @observable
  translation: { [key: string]: string } = {};

  isCompanyTeam: boolean;
  latestTime: number;

  constructor(data: Group) {
    super(data);
    const {
      set_abbreviation,
      members,
      is_team,
      description,
      pinned_post_ids,
      privacy,
      most_recent_post_created_at,
      created_at,
      most_recent_post_id,
      creator_id,
      guest_user_company_ids,
      permissions,
      deactivated,
      is_company_team,
      is_archived,
      converted_to_team,
    } = data;

    this.setAbbreviation = set_abbreviation;
    this.members = members;
    this.description = description;
    this.isTeam = is_team;
    this.pinnedPostIds = pinned_post_ids || [];
    this.privacy = privacy;
    this.latestTime = most_recent_post_created_at
      ? most_recent_post_created_at
      : created_at;
    this.creatorId = creator_id;
    this.createdAt = created_at;
    this.guestUserCompanyIds = guest_user_company_ids;
    this.permissions = permissions;
    this.mostRecentPostId = most_recent_post_id;

    this.deactivated = deactivated;
    this.isArchived = is_archived;
    this.isCompanyTeam = is_company_team;
    this.convertedToTeam = converted_to_team;
    reaction(
      () => this.type,
      async () => {
        this.translation['message.meGroup'] = await i18nT('message.meGroup');
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get isFavorite() {
    const favoriteGroupIds: number[] =
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || [];

    return favoriteGroupIds.some(groupId => groupId === this.id);
  }

  get isMember() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return (
      this.members && this.members.indexOf(userConfig.getGlipUserId()) >= 0
    );
  }

  @computed
  get displayName(): string {
    if (this.type === CONVERSATION_TYPES.TEAM) {
      return this.setAbbreviation || '';
    }
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId();
    const members: number[] = this.members || [];
    const diffMembers = _.difference(members, [currentUserId]);

    if (this.type === CONVERSATION_TYPES.ME) {
      const person = getEntity(ENTITY_NAME.PERSON, currentUserId);
      const meGroup = this.translation['message.meGroup'] || 'message.meGroup';
      return `${person.userDisplayNameForGroupName || ''} (${meGroup})`;
    }

    if (
      this.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ||
      this.type === CONVERSATION_TYPES.SMS
    ) {
      const person = getEntity(ENTITY_NAME.PERSON, diffMembers[0]);
      return person.userDisplayNameForGroupName || '';
    }

    if (this.type === CONVERSATION_TYPES.NORMAL_GROUP) {
      const names: string[] = [];
      const emails: string[] = [];
      diffMembers
        .map(id => getEntity(ENTITY_NAME.PERSON, id))
        .forEach(({ firstName, lastName, email }) => {
          if (!firstName && !lastName) {
            emails.push(email);
          } else if (firstName) {
            names.push(firstName);
          } else if (lastName) {
            names.push(lastName);
          }
        });
      return names
        .sort(compareName)
        .concat(emails.sort(compareName))
        .join(', ');
    }

    return '';
  }

  @computed
  get type(): CONVERSATION_TYPES {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId();

    const members = this.members || [];

    if (this.isTeam) {
      return CONVERSATION_TYPES.TEAM;
    }

    if (members.length === 1 && members[0] === currentUserId) {
      return CONVERSATION_TYPES.ME;
    }

    if (members.length === 2) {
      const otherId = _.difference(members, [currentUserId])[0];
      const otherMember = getEntity(ENTITY_NAME.PERSON, otherId);
      if (otherMember && otherMember.isPseudoUser) {
        return CONVERSATION_TYPES.SMS;
      }
      return CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
    }

    return CONVERSATION_TYPES.NORMAL_GROUP;
  }

  @computed
  get analysisType() {
    const type = this.type;
    let result = '';
    switch (type) {
      case CONVERSATION_TYPES.TEAM:
        result = 'Team conversation';
        break;
      case CONVERSATION_TYPES.NORMAL_ONE_TO_ONE:
        result = '1:1 conversation';
        break;
      case CONVERSATION_TYPES.NORMAL_GROUP:
        result = 'Group conversation';
        break;
    }
    return result;
  }

  @computed
  get membersExcludeMe() {
    const members = this.members || [];
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;

    const currentUserId = userConfig.getGlipUserId();

    return members.filter(member => member !== currentUserId);
  }

  @computed
  get creator() {
    return getEntity(ENTITY_NAME.PERSON, this.creatorId);
  }

  @computed
  get teamPermissionParams() {
    return {
      members: this.members,
      is_team: this.isTeam,
      guest_user_company_ids: this.guestUserCompanyIds,
      permissions: this.permissions,
    };
  }

  @computed
  get isCurrentUserHasPermissionAddMember() {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return groupService.isCurrentUserHasPermission(
      PERMISSION_ENUM.TEAM_ADD_MEMBER,
      this.teamPermissionParams,
    );
  }

  get isAdmin() {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return groupService.isCurrentUserHasPermission(
      PERMISSION_ENUM.TEAM_ADMIN,
      this.teamPermissionParams,
    );
  }

  isThePersonAdmin(personId: number) {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return this.type === CONVERSATION_TYPES.TEAM
      ? groupService.isTeamAdmin(personId, this.permissions)
      : false;
  }

  isThePersonGuest(personId: number) {
    if (this.guestUserCompanyIds && this.guestUserCompanyIds.length > 0) {
      const person = getEntity(ENTITY_NAME.PERSON, personId);
      if (person) {
        return this.guestUserCompanyIds.some(
          (x: number) => x === person.companyId,
        );
      }
    }
    return false;
  }

  @computed
  get canPost() {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return groupService.isCurrentUserHasPermission(
      PERMISSION_ENUM.TEAM_POST,
      this.teamPermissionParams,
    );
  }

  @computed
  get canPin() {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return groupService.isCurrentUserHasPermission(
      PERMISSION_ENUM.TEAM_PIN_POST,
      this.teamPermissionParams,
    );
  }

  static fromJS(data: Group) {
    return new GroupModel(data);
  }
}
