/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:05
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableModel } from 'sdk/framework/model';

import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';

export type GroupSearchProps = {
  onSelect: (params: { id: number }) => void;
  dialogTitle: string;
  listTitle: string;
  searchFunc: (searchKey: string) => Promise<SortableModel<any>[]>;
  defaultList: () => Promise<SortableModel<any>[]>;
};

export interface IGroupSearchViewModel {
  size: number;
  searchGroups: (key: string) => any;
  list: number[];
  getItemComponent: (
    id: number,
  ) => {
    Item: typeof ContactSearchItem | typeof GroupSearchItem;
    props: { itemId: number };
  };
}
export type GroupSearchViewProps = GroupSearchProps & IGroupSearchViewModel;
