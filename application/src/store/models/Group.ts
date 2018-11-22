/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 18:22:26
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import _ from 'lodash';
import { Group, Profile } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import ProfileModel from '@/store/models/Profile';
import { getEntity, getSingleEntity, getGlobalValue } from '@/store/utils';
import { compareName } from '../helper';
import { CONVERSATION_TYPES } from '@/constants';
import { GLOBAL_KEYS } from '@/store/constants';
import Base from './Base';
import { t } from 'i18next';

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
  pinnedPostIds?: number[];
  @observable
  privacy?: string;
  @observable
  draft?: string;
  @observable
  sendFailurePostIds?: number[];
  @observable
  creatorId: number;

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
      draft,
      send_failure_post_ids,
      most_recent_post_created_at,
      created_at,
      creator_id,
    } = data;

    this.setAbbreviation = set_abbreviation;
    this.members = members;
    this.description = description;
    this.isTeam = is_team;
    this.pinnedPostIds = pinned_post_ids;
    this.privacy = privacy;
    this.draft = draft;
    this.sendFailurePostIds = send_failure_post_ids;
    this.latestTime = most_recent_post_created_at
      ? most_recent_post_created_at
      : created_at;
    this.creatorId = creator_id;
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

  @computed
  get displayName(): string {
    if (this.type === CONVERSATION_TYPES.TEAM) {
      return this.setAbbreviation || '';
    }

    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const members: number[] = this.members || [];
    const diffMembers = _.difference(members, [currentUserId]);

    if (this.type === CONVERSATION_TYPES.ME) {
      const person = getEntity(ENTITY_NAME.PERSON, currentUserId);
      if (person.displayName) {
        return `${person.displayName} (${t('me')})`;
      }
      return '';
    }

    if (
      this.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ||
      this.type === CONVERSATION_TYPES.SMS
    ) {
      const person = getEntity(ENTITY_NAME.PERSON, diffMembers[0]);
      return person.displayName || '';
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
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

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
  get membersExcludeMe() {
    const members = this.members || [];

    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    return members.filter(member => member !== currentUserId);
  }

  @computed
  get creator() {
    return getEntity(ENTITY_NAME.PERSON, this.creatorId);
  }

  static fromJS(data: Group) {
    return new GroupModel(data);
  }
}
