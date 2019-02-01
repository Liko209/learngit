/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';

type Props = {
  ids: number[];
};

type ViewProps = {
  groups: GroupModel[];
  hasMore: boolean;
  title: string;
  terms: string[];
  onClick: (
    group: GroupModel,
  ) => (event: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (sectionIndex: number, cellIndex: number) => () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  sectionIndex: number;
  selectIndex: number[];
  setSearchSection: (items: any) => void;
};

export { Props, ViewProps, GroupModel };
