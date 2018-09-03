import { Group } from 'sdk/models';

const transformGroupSortKey = (dataModel: Group) => ({
  id: dataModel.id,
  sortKey: -(
    dataModel.most_recent_post_created_at ||
    (dataModel.is_new && dataModel.created_at)
  ),
});

export { transformGroupSortKey };
