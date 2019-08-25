/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:05
 * Copyright © RingCentral. All rights reserved.
 */

export type GroupSearchProps = {
  onSelectChange: (params: { id: number }) => void;
};

export interface IGroupSearchViewModel {
  size: number;
  searchGroups: (key: string) => any;
  list: number[];
}
export type GroupSearchViewProps = GroupSearchProps & IGroupSearchViewModel;
