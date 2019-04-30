/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

// import { MembersViewProps } from '../types';

type MemberListProps = {
  id: number;
  filteredMemberIds: number[];
  sortedAllMemberIds: number[];
  width: number;
  height: number;
  searchInput: string;
  setShowEmpty: (flag: boolean) => void;
};

type MemberListViewProps = {
  onScrollEvent: (event: { scrollTop: number }) => void;
  showEmpty: boolean;
};

export { MemberListProps, MemberListViewProps };
