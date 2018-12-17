/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

type MemberListProps = {
  id: number;
};

type MemberListViewProps = MemberListProps & {
  memberIds: number[];
};

export { MemberListProps, MemberListViewProps };
