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
const { GROUP_QUERY_TYPE, ENTITY, GroupService } = service;
export default class FavoriteListPresenter extends OrderListPresenter {
  eventName: string;
  groupType: GROUP_QUERY_TYPE;
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
