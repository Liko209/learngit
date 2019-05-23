/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

type MemberListProps = {
  id: number;
  filteredMemberIds: number[];
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
  width: number;
  height: number;
  searchInput: string;
  setShowEmpty: (flag: boolean) => void;
};

type MemberListViewProps = {
  onScrollEvent: (event: React.UIEvent<HTMLElement>) => void;
  showEmpty: boolean;
};

export { MemberListProps, MemberListViewProps };
