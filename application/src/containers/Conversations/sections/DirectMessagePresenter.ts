import OrderListPresenter from '@/store/base/OrderListPresenter';
import OrderListStore from '@/store/base/OrderListStore';
import { ENTITY_NAME } from '@/store';
import { service } from 'sdk';
const { GROUP_QUERY_TYPE, ENTITY, GroupService, AccountService } = service;
export default class DirectMessagePresenter extends OrderListPresenter {
  eventName: string;
  groupType: string;
  constructor() {
    super(
      new OrderListStore(`ConversationList: ${GROUP_QUERY_TYPE.GROUP}`),
      () => true,
      (dataModel: any) => {
        return ({
          id: dataModel.id,
          sortKey: -(dataModel.most_recent_post_created_at ||
            (dataModel.is_new && dataModel.created_at)),
        });
      },
    );

    this.groupType = GROUP_QUERY_TYPE.GROUP;
    this.eventName = ENTITY.PEOPLE_GROUPS;
    this.init();
  }

  init() {
    const groupCallback = ({ type, entities }: IIncomingData) => {
      this.handleIncomingData(ENTITY_NAME.GROUP, { type, entities });
    };
    this.subscribeNotification(this.eventName, groupCallback);
  }

  async fetchData() {
    const groupService = GroupService.getInstance<GroupService>();
    const groups = await groupService.getGroupsByType(this.groupType);
    this.handlePageData(ENTITY_NAME.GROUP, groups, true);
  }

  getCurrentUserId() {
    const accountService = AccountService.getInstance<AccountService>();
    return accountService.getCurrentUserId();
  }
}
