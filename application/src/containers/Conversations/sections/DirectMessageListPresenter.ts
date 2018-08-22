import { service } from 'sdk';
import ConversationListPresenter from './ConversationListPresenter';
const { GROUP_QUERY_TYPE, ENTITY, AccountService } = service;
export default class DirectMessageListPresenter extends ConversationListPresenter {
  constructor() {
    super(
      'people',
      'Direct Message',
      ENTITY.PEOPLE_GROUPS,
      GROUP_QUERY_TYPE.GROUP,
      'Direct Message',
    );
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<service.AccountService>();
    return accountService.getCurrentUserId();
  }
}
