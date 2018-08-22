import OrderListPresenter from '../../../store/base/OrderListPresenter';
import OrderListStore from '../../../store/base/OrderListStore';
import { ENTITY_NAME } from '../../../store';
import { Group } from 'sdk/src/models';
import { service } from 'sdk';
import { IConversationSectionPresenter }
  from '../../../containers/Conversations/sections/IConversationSection';
const { GroupService } = service;
export default class ConversationListPresenter extends OrderListPresenter
  implements IConversationSectionPresenter {
  public entityName: ENTITY_NAME = ENTITY_NAME.GROUP;
  constructor(
    public iconName: string,
    public title: string,
    public entity: string,
    public queryType: string,
    public anchor: string,
  ) {
    super(
      new OrderListStore(`ConversationList: ${queryType}`),
      () => true,
      (dataModel: Group, index: number) => ({
        id: dataModel.id,
        sortKey: -(
          dataModel.most_recent_post_created_at ||
          (dataModel.is_new && dataModel.created_at)
        ),
      }),
    );
    const groupCallback = ({ type, entities }: IIncomingData) => {
      this.handleIncomingData(this.entityName, { type, entities });
    };
    this.subscribeNotification(this.entity, groupCallback);
  }

  async fetchData() {
    const groupService = GroupService.getInstance<service.GroupService>();
    const groups = await groupService.getGroupsByType(this.queryType);
    this.handlePageData(this.entityName, groups, true);
  }
}
