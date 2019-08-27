/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:05
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableModel } from "sdk/framework/model";


export type GroupSearchProps = {
  onSelect: (params: { id: number }) => void;
  dialogTitle: string;
  listTitle: string;
  searchFunc:(searchKey:string)=>Promise<{
    terms: string[];
    sortableModels: SortableModel<any>[];
}>
};

export interface IGroupSearchViewModel {
  size: number;
  searchGroups: (key: string) => any;
  list: number[];
}
export type GroupSearchViewProps = GroupSearchProps & IGroupSearchViewModel;
