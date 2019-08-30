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
  shouldHide: boolean;
  group: GroupModel;
  membersData: {
    isLoading: boolean;
    fullMemberLen: number;
    fullGuestLen: number;
    shownMemberIds: number[];
    shownGuestIds: number[];
    personNameMap: { [id: number]: string };
  };
  canAddMembers: boolean;
  shouldShowLink: boolean;
  loadingH: number;
  allMemberLength?: number;
  isTeam?: boolean;
  setWrapperWidth: (width: number) => void;
  init: () => void;
  dispose: () => void;
};

export { RightShelfMemberListProps, RightShelfMemberListViewProps };
