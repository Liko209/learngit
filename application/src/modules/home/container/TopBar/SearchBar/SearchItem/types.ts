/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';
import GroupModel from '@/store/models/Group';
import { RecentSearchTypes } from 'sdk/module/search/entity';

interface ISearchItemModel {
  addRecentRecord: () => void;
}

type Props = {
  id: number;
  sectionIndex: number;
  selectIndex: number[];
  cellIndex: number;
  didChange: (sectionIndex: number, cellIndex: number) => void;
};

type BaseViewProps = {
  person: PersonModel;
  hasMore: boolean;
  title: string;
  terms: string[];
  goToConversation: (id: number) => void;
  handleJoinTeam: (item: GroupModel) => void;
  onMouseEnter: (sectionIndex: number, cellIndex: number) => () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  setSearchSection: (items: any) => void;
  selectIndex: number[];
  sectionIndex: number;
  cellIndex: number;
  hovered: boolean;
  addRecentRecord: () => void;
  onClose: () => void;
  onClear: () => void;
};

export {
  Props,
  BaseViewProps,
  PersonModel,
  ISearchItemModel,
  RecentSearchTypes,
};
