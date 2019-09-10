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
  didChange: () => void;
  recentId: number;
};

type BaseViewProps = {
  title: string;
  terms?: string[];
  goToConversation: (id: number) => void;
  handleJoinTeam: (item: GroupModel) => void;
  onMouseEnter: () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  hovered: boolean;
  addRecentRecord: () => void;
  onClose: () => void;
  onClear: () => void;
  dataTrackingDomain: string;
};

export {
  Props,
  BaseViewProps,
  PersonModel,
  ISearchItemModel,
  RecentSearchTypes,
};
