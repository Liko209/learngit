/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:39
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import ConversationListPresenter from './ConversationListPresenter';
const { GROUP_QUERY_TYPE, ENTITY, AccountService } = service;
export default class DirectMessageListPresenter extends ConversationListPresenter {
  constructor() {
    super(
      'people',
      'Direct Messages',
      ENTITY.PEOPLE_GROUPS,
      GROUP_QUERY_TYPE.GROUP,
      'Direct Messages',
    );
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<service.AccountService>();
    return accountService.getCurrentUserId();
  }
}
