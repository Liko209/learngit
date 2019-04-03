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
};

type MemberListViewProps = {
  onScrollEvent: (event: { scrollTop: number }) => void;
};

export { MemberListProps, MemberListViewProps };
