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
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils';
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
import { LOADING_DELAY } from '../RightRail/constants';

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

  private _loadingTimeout: NodeJS.Timeout;

  @observable
  private _wrapperWidth: number = RIGHT_SHELF_DEFAULT_WIDTH;

  @observable
  membersData: {
    isLoading: boolean;
    fullMemberLen: number;
    fullGuestLen: number;
    shownMemberIds: number[];
    shownGuestIds: number[];
    personNameMap: { [id: number]: string };
  } = {
    isLoading: true,
    fullMemberLen: 0,
    fullGuestLen: 0,
    shownMemberIds: [],
    shownGuestIds: [],
    personNameMap: {},
  };

  private _fullMemberIds: number[] = [];

  private _fullGuestIds: number[] = [];

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
        this._loadingTimeout = setTimeout(() => {
          this._setData(true);
        }, LOADING_DELAY);

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
        const cachedIdsLen = (this._membersCache[this.props.groupId] || [])
          .length;
        // only react to member length change within the same conversation
        if (len === undefined || cachedIdsLen <= 0) return;
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
    this._fullMemberIds = realMemberIds.concat(optionalIds);
    this._fullGuestIds = guestIds;
    clearTimeout(this._loadingTimeout);
    this._setData(false);
  }

  @action
  private _setData(isLoading: boolean = false) {
    if (isLoading) {
      this.membersData = {
        isLoading: true,
        fullMemberLen: 0,
        fullGuestLen: 0,
        shownMemberIds: [],
        shownGuestIds: [],
        personNameMap: {},
      };
      return;
    }
    const { _fullMemberIds, _fullGuestIds } = this;
    const shownMemberIds = this._getSubset(
      _fullMemberIds,
      MAX_MEMBER_ROW_COUNT,
    );
    const shownGuestIds = this._getSubset(_fullGuestIds, 1);
    const personNameMap = {};
    [...shownMemberIds, ...shownGuestIds].forEach(id => {
      personNameMap[id] = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        id,
      ).userDisplayName;
    });

    this.membersData = {
      isLoading,
      fullMemberLen: _fullMemberIds.length,
      fullGuestLen: _fullGuestIds.length,
      shownGuestIds,
      shownMemberIds,
      personNameMap,
    };
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
  get shouldShowLink() {
    return ![
      CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      CONVERSATION_TYPES.ME,
      CONVERSATION_TYPES.SMS,
    ].includes(this.group.type);
  }

  @computed
  get loadingH() {
    if (!this.membersData.isLoading) {
      return 0;
    }
    return (
      (this._guestCompanyIdsLen > 0 ? GUEST_SECTION_HEIGHT : 0) +
      Math.min(
        this.allMemberLength && this.allMemberLength > this._countPerRow
          ? Math.ceil(this.allMemberLength / this._countPerRow)
          : 1,
        MAX_MEMBER_ROW_COUNT,
      ) *
        (AVATAR_WIDTH + AVATAR_MARGIN_BOTTOM)
    );
  }

  private get _countPerRow() {
    return Math.floor(
      (this._wrapperWidth - WRAPPER_PADDING) / (AVATAR_PADDING + AVATAR_WIDTH),
    );
  }

  private _getSubset(fullIds: number[], maxRowCount: number) {
    const countPerRow = Math.floor(
      (this._wrapperWidth - WRAPPER_PADDING) / (AVATAR_PADDING + AVATAR_WIDTH),
    );
    let showCount = Math.min(maxRowCount * countPerRow, fullIds.length);
    if (showCount < fullIds.length) {
      showCount = showCount - 1;
    }
    return fullIds.slice(0, showCount);
  }

  @action
  setWrapperWidth = (width: number) => {
    this._wrapperWidth =
      width < RIGHT_SHELF_MIN_WIDTH ? RIGHT_SHELF_MIN_WIDTH : width;
    this._setData();
  };

  @computed
  get canAddMembers() {
    return !this.isTeam ||
      this.group.isCurrentUserHasPermissionAddMember;
  }
}

export { RightShelfMemberListViewModel };
