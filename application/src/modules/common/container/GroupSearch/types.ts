/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:05
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableModel } from "sdk/framework/model";

import { Props } from '@/containers/Downshift/GroupSearch/GroupSearchItem/types';

export type GroupSearchProps = {
  onSelect: (params: { id: number }) => void;
  dialogTitle: string;
  listTitle: string;
  searchFunc:(searchKey:string)=>Promise< SortableModel<any>[]>
};


export interface IGroupSearchViewModel {
  size: number;
  searchGroups: (key: string) => any;
  list: number[];
  getItemComponent: (
    id: number,
  ) => { Item: React.ComponentType<Props>; props: { itemId: number } };
}
export type GroupSearchViewProps = GroupSearchProps & IGroupSearchViewModel;
