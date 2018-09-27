/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { Group } from 'sdk/models';
import OrderListHandler from '@/store/base/OrderListHandler';
import storeManager, { ENTITY_NAME } from '@/store';
import { getEntity, getSingleEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import MyStateModel from '@/store/models/MyState';
import GroupStateModel from '@/store/models/GroupState';
import { MyState } from 'sdk/src/models';
import _ from 'lodash';

const { GroupService, AccountService, ProfileService } = service;

interface IConversationSectionPresenterOptions {
  entity: string;
  transformFunc: Function;
  queryType?: service.GROUP_QUERY_TYPE;
  maxLimit?: number;
}

class ConversationSectionPresenter extends OrderListHandler<Group, GroupModel> {
  public entityName: ENTITY_NAME = ENTITY_NAME.GROUP;
  private entity: string;
  private queryType?: service.GROUP_QUERY_TYPE;
  private globalStore = storeManager.getGlobalStore();

  constructor(options: IConversationSectionPresenterOptions) {
    super(() => true, options.transformFunc);
    this.entity = options.entity;
    this.queryType = options.queryType;
    this.init();
  }

  async init() {
    await this.fetchData();

    // When groups change, fetch data from service again
    this.entity &&
      this.subscribeNotification(this.entity, () => this.fetchData());
  }

  async fetchData() {
    if (!this.queryType) return;
    const groupService = GroupService.getInstance<service.GroupService>();
    const groups = await groupService.getGroupsByType(this.queryType);
    const store = this.getStore();
    store.clearAll();
    this.handlePageData(this.entityName, groups, true);
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<service.AccountService>();
    return accountService.getCurrentUserId();
  }

  getProfile() {
    const profileService = ProfileService.getInstance<service.ProfileService>();
    return profileService.getProfile();
  }

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }

  calculateUmi() {
    const store = this.getStore();
    const groupIds = store.getIds();
    const lastGroupId = getSingleEntity<MyState, MyStateModel>(
      ENTITY_NAME.MY_STATE,
      'lastGroupId',
    ) as number;
    const groupStates = _.map(groupIds, (groupId: number) => {
      return getEntity(ENTITY_NAME.GROUP_STATE, groupId) as GroupStateModel;
    });

    let important = false;
    const unreadCount: number = _.sumBy(
      groupStates,
      (groupState: GroupStateModel) => {
        const isCurrentGroup = lastGroupId && lastGroupId === groupState.id;
        const group = getEntity(ENTITY_NAME.GROUP, groupState.id) as GroupModel;

        const unreadCount = isCurrentGroup
          ? 0
          : (!group.isTeam && (groupState.unreadCount || 0)) ||
            (groupState.unreadMentionsCount || 0);
        important = important || !!groupState.unreadMentionsCount;
        return unreadCount;
      },
    );

    this.globalStore.set(`UMI.${this.queryType}`, unreadCount);
    return { important, unreadCount };
  }
}

export default ConversationSectionPresenter;
export { ConversationSectionPresenter };
