/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import OrderListPresenter from '../../../store/base/OrderListPresenter';
import OrderListStore from '../../../store/base/OrderListStore';
import { ENTITY_NAME } from '../../../store';
import { Group } from 'sdk/models';
import { service } from 'sdk';
import { IIncomingData } from '../../../store/store';
import GroupModel from '../../../store/models/Group';
const { GroupService, AccountService } = service;
export default class ConversationListPresenter extends OrderListPresenter<Group, GroupModel> {
  public entityName: ENTITY_NAME = ENTITY_NAME.GROUP;
  constructor(
    public entity?: string,
    public queryType?: string,
    transformFunc?: Function,
  ) {
    super(
      new OrderListStore(`ConversationList: ${queryType}`),
      () => true,
      transformFunc ? transformFunc : (dataModel: Group, index: number) => ({
        id: dataModel.id,
        sortKey: -(
          dataModel.most_recent_post_created_at ||
          (dataModel.is_new && dataModel.created_at)
        ),
      }),
    );
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
