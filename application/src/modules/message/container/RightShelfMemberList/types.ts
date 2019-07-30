/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 13:21:00
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';

type RightShelfMemberListProps = {
  groupId: number;
};

type RightShelfMemberListViewProps = RightShelfMemberListProps & {
  group: GroupModel;
  isLoading: boolean;
  fullMemberIds: number[];
  fullGuestIds: number[];
  shownMemberIds: number[];
  shownGuestIds: number[];
  allMemberLength?: number;
  isTeam?: boolean;
  personNameMap: { [id: string]: string };
  setWrapperWidth: (width: number) => void;
  init: () => void;
};

export { RightShelfMemberListProps, RightShelfMemberListViewProps };
