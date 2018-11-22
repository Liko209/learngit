/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:40:02
 * Copyright © RingCentral. All rights reserved.
 */

enum GROUP_TYPES {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
}
enum GROUP_LIST_TITLE {
  TEAM_MEMBERS = 'Team members',
  GROUP_MEMBERS = 'Group members',
}
type GroupBodyProps = {
  type: GROUP_TYPES;
  displayName: string;
  description?: string;
};
type GroupListProps = {
  counts: number;
  type: GROUP_TYPES;
  membersList?: {name: string}[];
};
type GroupHeaderProps = {
  text: string;
  destroy?: () => void;
};
export { GroupBodyProps, GroupHeaderProps, GroupListProps, GROUP_TYPES, GROUP_LIST_TITLE };
