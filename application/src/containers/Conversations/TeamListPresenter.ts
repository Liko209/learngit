import OrderListPresenter from '../../store/base/OrderListPresenter';
import OrderListStore from '../../store/base/OrderListStore';
import { ENTITY_NAME } from '../../store';
import { Group } from 'sdk/src/models';
import { service } from 'sdk';
const  { GROUP_QUERY_TYPE, ENTITY, GroupService } = service;
export default class FavoriteListPresenter extends OrderListPresenter {
  constructor() {
    super(
      new OrderListStore(`ConversationList: ${GROUP_QUERY_TYPE.TEAM}`),
      () => true,
      (dataModel: Group, index: number) => ({
        id: dataModel.id,
        sortKey: -(
          dataModel.most_recent_post_created_at ||
          (dataModel.is_new && dataModel.created_at)
        ),
      }),
    );
    const groupCallback = ({ type, entities }) => {
      this.handleIncomingData(ENTITY_NAME.GROUP, { type, entities });
    };
    this.subscribeNotification(ENTITY.TEAM_GROUPS, groupCallback);
  }

  async fetchData() {
    const groupService  = GroupService.getInstance<service.GroupService>();
    const groups = await groupService.getGroupsByType(GROUP_QUERY_TYPE.TEAM);
    this.handlePageData(ENTITY_NAME.GROUP, groups, true);
  }
}
