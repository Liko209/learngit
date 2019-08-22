/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 13:51:55
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import {
  RightShelfMemberListViewProps,
  RightShelfMemberListProps,
} from './types';
import StoreViewModel from '@/store/ViewModel';
import { GroupService, Group } from 'sdk/module/group';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupModel from '@/store/models/Group';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import _ from 'lodash';
import { notificationCenter, SERVICE } from 'sdk/service';
import { CONVERSATION_TYPES } from '@/constants';
import {
  RIGHT_SHELF_DEFAULT_WIDTH,
  RIGHT_SHELF_MIN_WIDTH,
} from 'jui/foundation/Layout/Responsive';

const GUEST_SECTION_HEIGHT = 85;
const AVATAR_PADDING = 4;
const AVATAR_WIDTH = 32;
const AVATAR_MARGIN_BOTTOM = 8;
const WRAPPER_PADDING = 24;
const DEFAULT_MEMBER_FETCH_COUNT = 40;
const DEFAULT_GUEST_FETCH_COUNT = 10;
const MAX_MEMBER_ROW_COUNT = 3;
class RightShelfMemberListViewModel
  extends StoreViewModel<RightShelfMemberListProps>
  implements RightShelfMemberListViewProps {
  groupId: number;

  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );

  @observable
  private _wrapperWidth: number = RIGHT_SHELF_DEFAULT_WIDTH;

  @observable
  isLoading: boolean = true;

  @observable
  fullMemberIds: number[] = [];

  @observable
  fullGuestIds: number[] = [];

  private _membersCache: {
    [groupId: string]: number[];
  } = {};

  constructor(props: RightShelfMemberListProps) {
    super(props);
  }

  dispose = () => {
    notificationCenter.off(
      SERVICE.FETCH_REMAINING_DONE,
      this._getMemberAndGuestIds.bind(this),
    );
    super.dispose();
  };

  init = () => {
    notificationCenter.on(
      SERVICE.FETCH_REMAINING_DONE,
      this._getMemberAndGuestIds.bind(this),
    );
    this.reaction(
      () => this.props.groupId,
      (id: number) => {
        if (id === undefined) return;
        this.isLoading = true;
        setTimeout(() => {
          this._getMemberAndGuestIds();
        });
      },
      { fireImmediately: true },
    );
    this.reaction(
      () => this.allMemberLength,
      (len: number) => {
        // only react to member length change within the same conversation
        const cachedIdsLen = (this._membersCache[this.props.groupId] || [])
          .length;
        if (len === undefined || cachedIdsLen <= 0) return;
        if (len > cachedIdsLen) {
          const addedPersonCompanyIds = _.difference(
            this.group.members,
            this._membersCache[this.props.groupId],
          ).map(
            id =>
              getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id).companyId,
          );
          // Ignore this reaction when a guest from a new companyId is added, use next reaction instead.
          if (
            addedPersonCompanyIds.some(companyId =>
              this._isNewGuestCompanyId(companyId),
            )
          ) {
            return;
          }
        }

        this._getMemberAndGuestIds();
      },
    );
    this.reaction(
      () => this._guestCompanyIdsLen,
      (len: number) => {
        if (len === undefined) return;
        this._getMemberAndGuestIds();
      },
    );
  };

  @action
  private async _getMemberAndGuestIds() {
    const originalGroupId = this.props.groupId;
    const {
      realMemberIds,
      guestIds,
      optionalIds,
    } = await this._groupService.getMemberAndGuestIds(
      this.props.groupId,
      DEFAULT_MEMBER_FETCH_COUNT,
      DEFAULT_GUEST_FETCH_COUNT,
    );
    if (originalGroupId !== this.props.groupId) return;
    this._membersCache = { [this.props.groupId]: this.group.members };
    this.isLoading = false;
    this.fullMemberIds = realMemberIds.concat(optionalIds);
    this.fullGuestIds = guestIds;
  }

  private _isNewGuestCompanyId(companyId: number) {
    return (
      companyId !== this._currentCompanyId &&
      !(this.group.guestUserCompanyIds || []).includes(companyId)
    );
  }

  @computed
  get shouldHide() {
    const { group } = this;
    return !group || group.isMocked || group.type === CONVERSATION_TYPES.ME;
  }

  @computed
  private get _currentCompanyId() {
    return this.group.companyId;
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId);
  }

  @computed
  private get _guestCompanyIdsLen() {
    return this.group.guestUserCompanyIds
      ? this.group.guestUserCompanyIds.length
      : 0;
  }

  @computed
  get allMemberLength() {
    const members = this.group.members;
    if (!members) return undefined;
    return members.length;
  }

  @computed
  get isTeam() {
    return this.group.isTeam;
  }

  @computed
  get loadingH() {
    return (
      (this._guestCompanyIdsLen > 0 ? GUEST_SECTION_HEIGHT : 0) +
      Math.min(
        this.allMemberLength && this.allMemberLength > this.countPerRow
          ? Math.ceil(this.allMemberLength / this.countPerRow)
          : 1,
        MAX_MEMBER_ROW_COUNT,
      ) *
        (AVATAR_WIDTH + AVATAR_MARGIN_BOTTOM)
    );
  }

  @computed
  get countPerRow() {
    return Math.floor(
      (this._wrapperWidth - WRAPPER_PADDING) / (AVATAR_PADDING + AVATAR_WIDTH),
    );
  }

  @computed
  get shownMemberIds() {
    const rowCount = MAX_MEMBER_ROW_COUNT;
    let showCount = Math.min(
      rowCount * this.countPerRow,
      this.fullMemberIds.length,
    );
    if (showCount < this.fullMemberIds.length) {
      showCount = showCount - 1;
    }
    return this.fullMemberIds.slice(0, showCount);
  }

  @computed
  get shownGuestIds() {
    const rowCount = 1;
    let showCount = Math.min(
      rowCount * this.countPerRow,
      this.fullGuestIds.length,
    );
    if (showCount < this.fullGuestIds.length) {
      showCount = showCount - 1;
    }
    return this.fullGuestIds.slice(0, showCount);
  }

  @computed
  get personNameMap() {
    const map = {};
    [...this.shownGuestIds, ...this.shownMemberIds].forEach(id => {
      map[id] = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        id,
      ).userDisplayName;
    });
    return map;
  }

  @action
  setWrapperWidth = (width: number) => {
    this._wrapperWidth =
      width < RIGHT_SHELF_MIN_WIDTH ? RIGHT_SHELF_MIN_WIDTH : width;
  };

  @computed
  private get _currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  private get _isCurrentUserGuest() {
    return this.group.isThePersonGuest(this._currentUserId);
  }

  @computed
  private get _isCurrentUserAdmin() {
    return this.group.isAdmin;
  }

  @computed
  private get _canTeamAddMembers() {
    const permissionFlags = this._groupService.getTeamUserPermissionFlags(
      this.group.permissions || {},
    );

    return Boolean(permissionFlags.TEAM_ADD_MEMBER);
  }

  @computed
  private get _canAddTeamMembers() {
    return this._isCurrentUserAdmin || this._canTeamAddMembers;
  }

  @computed
  get canAddMembers() {
    if (!this.isTeam) {
      return true;
    }

    if (this._isCurrentUserGuest) {
      return false;
    }

    return this._canAddTeamMembers;
  }
}

export { RightShelfMemberListViewModel };
