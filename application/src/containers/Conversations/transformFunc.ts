import { Group } from 'sdk/models';

const transformGroupSortKey = (dataModel: Group) => ({
  id: dataModel.id,
  sortKey: -(
    dataModel.most_recent_post_created_at || dataModel.created_at
  ),
});

export { transformGroupSortKey };
