/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchModel } from 'sdk/module/search/entity';
import { Group } from 'sdk/module/group/entity';

type RecentSearchProps = {};

type RecentSearchViewProps = {
  onKeyUp: () => void;
  onKeyDown: () => void;
  onEnter: (e: KeyboardEvent) => void;
  recentRecord: RecentSearchModel[];
  selectIndex: number;
  resetSelectIndex: () => void;
  setSelectIndex: (index: number) => void;
  clearRecent: () => void;
  selectIndexChange: (index: number) => void;
};

export { RecentSearchProps, RecentSearchViewProps, RecentSearchModel, Group };
