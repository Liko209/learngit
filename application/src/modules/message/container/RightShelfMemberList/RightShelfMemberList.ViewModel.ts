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

const AVATAR_PADDING = 4;
const AVATAR_WIDTH = 32;
const WRAPPER_PADDING = 24;
class RightShelfMemberListViewModel
  extends StoreViewModel<RightShelfMemberListProps>
  implements RightShelfMemberListViewProps {
  groupId: number;

  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );

  @observable
  private _wrapperWidth: number;

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

  init = () => {
    this.reaction(
      () => this.props.groupId,
      (id: number) => {
        if (id === undefined) return;
        this._getMemberAndGuestIds();
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
    const {
      memberIds,
      guestIds,
    } = await this._groupService.getMembersAndGuestIds(this.props.groupId);
    this._membersCache = { [this.props.groupId]: this.group.members };
    this.isLoading = false;
    this.fullMemberIds = memberIds;
    this.fullGuestIds = guestIds;
  }

  private _isNewGuestCompanyId(companyId: number) {
    return (
      companyId !== this._currentCompanyId &&
      !(this.group.guestUserCompanyIds || []).includes(companyId)
    );
  }

  @computed
  private get _currentCompanyId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
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
  get countPerRow() {
    return Math.floor(
      (this._wrapperWidth - WRAPPER_PADDING) / (AVATAR_PADDING + AVATAR_WIDTH),
    );
  }

  @computed
  get shownMemberIds() {
    const rowCount = this.fullGuestIds.length > 0 ? 3 : 4;
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
    this._wrapperWidth = width;
  };
}

export { RightShelfMemberListViewModel };
