/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { Group } from 'sdk/models';
import OrderListPresenter from '@/store/base/OrderListPresenter';
import OrderListStore from '@/store/base/OrderListStore';
import { ENTITY_NAME } from '@/store';
import { IIncomingData } from '@/store/store';
import GroupModel from '@/store/models/Group';

const { GroupService, AccountService } = service;

class ConversationSectionPresenter extends OrderListPresenter<Group, GroupModel> {
  public entityName: ENTITY_NAME = ENTITY_NAME.GROUP;
  public entity: string;
  public queryType?: service.GROUP_QUERY_TYPE;

  constructor(
    options: {
      entity: string;
      transformFunc: Function;
      queryType?: service.GROUP_QUERY_TYPE;
    },
  ) {
    super(
      new OrderListStore(`ConversationList: ${options.queryType}`),
      () => true,
      options.transformFunc,
    );
    this.entity = options.entity;
    this.queryType = options.queryType;
    this.init();
  }

  init() {
    const groupCallback = ({ type, entities }: IIncomingData<Group>) => {
      this.handleIncomingData(this.entityName, { type, entities });
    };
    this.entity && this.subscribeNotification(this.entity, groupCallback);
  }

  async fetchData() {
    if (!this.queryType) {
      return;
    }
    const groupService = GroupService.getInstance<service.GroupService>();
    const groups = await groupService.getGroupsByType(this.queryType);
    this.handlePageData(this.entityName, groups, true);
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<service.AccountService>();
    return accountService.getCurrentUserId();
  }

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default ConversationSectionPresenter;
export { ConversationSectionPresenter };
