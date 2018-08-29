/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 16:51:49
 * Copyright © RingCentral. All rights reserved.
 */

import OrderListPresenter from '../../store/base/OrderListPresenter';
import OrderListStore from '../../store/base/OrderListStore';
import { ENTITY_NAME } from '../../store';
import { service } from 'sdk';
import { Group } from 'sdk/src/models';
import { IIncomingData } from '../../store/store';
import GroupModel from '../../store/models/Group';
const { GROUP_QUERY_TYPE, ENTITY, GroupService, AccountService } = service;
export default class FavoriteListPresenter extends OrderListPresenter<Group, GroupModel> {
  eventName: string;
  groupType: string;
  constructor() {
    super(
      new OrderListStore(`ConversationList: ${GROUP_QUERY_TYPE.FAVORITE}`),
      () => true,
      (dataModel: Group, index: number) => ({
        id: dataModel.id,
        sortKey: index,
      }),
    );
    this.groupType = GROUP_QUERY_TYPE.FAVORITE;
    this.eventName = ENTITY.FAVORITE_GROUPS;
    this.init();
  }
  init() {
    const groupCallback = ({ type, entities }: IIncomingData<Group>) => {
      this.handleIncomingData(ENTITY_NAME.GROUP, { type, entities });
    };
    this.subscribeNotification(this.eventName, groupCallback);
  }

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<service.AccountService>();
    return accountService.getCurrentUserId();
  }

  async fetchData() {
    const groupService = GroupService.getInstance<service.GroupService>();
    const groups = await groupService.getGroupsByType(this.groupType);
    this.handlePageData(ENTITY_NAME.GROUP, groups, true);
  }
}
