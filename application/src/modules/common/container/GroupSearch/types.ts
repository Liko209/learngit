/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:05
 * Copyright © RingCentral. All rights reserved.
 */
import { Props } from '@/containers/Downshift/GroupSearch/GroupSearchItem/types';

export type GroupSearchProps = {
  onSelectChange: (params: { id: number }) => void;
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
