/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { Group } from 'sdk/models';
import OrderListHandler from '@/store/base/OrderListHandler';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';

const { GroupService, AccountService } = service;

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

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default ConversationSectionPresenter;
export { ConversationSectionPresenter };
