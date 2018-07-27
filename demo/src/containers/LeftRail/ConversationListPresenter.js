/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-04-01 15:20:56
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { ENTITY_NAME } from '@/store';
import OrderListStore from '@/store/base/OrderListStore';
import OrderListPresenter from '@/store/base/OrderListPresenter';

const { GroupService } = service;

export default class ConversationListPresenter extends OrderListPresenter {
  constructor(groupType, eventName) {
    super(new OrderListStore(`ConversationList: ${groupType}`), eventName);
    this.groupType = groupType;
    this.eventName = eventName;
    this.transformFunc = dataModel => ({
      id: dataModel.id,
      sortKey: -(
        dataModel.most_recent_post_created_at ||
        (dataModel.is_new && dataModel.created_at)
      )
    });
    this.isMatchedFunc = () => true;

    this.init();
  }

  init() {
    const groupCallback = ({ type, entities }) => {
      this.handleIncomingData(ENTITY_NAME.GROUP, { type, entities });
    };
    this.subscribeNotification(this.eventName, groupCallback);
  }

  async fetchData() {
    const groupService = GroupService.getInstance();
    const groups = await groupService.getGroupsByType(this.groupType);
    this.handlePageData(ENTITY_NAME.GROUP, groups, true);
  }
}
