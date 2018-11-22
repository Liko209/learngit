/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:40:02
 * Copyright © RingCentral. All rights reserved.
 */

enum GROUP_BODY_TYPES {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
}
type GroupBodyProps = {
  type: GROUP_BODY_TYPES;
  displayName: string;
  description?: string;
};
type GroupHeaderProps = {
  text: string;
  destroy?: () => void;
};
export { GroupBodyProps, GroupHeaderProps, GROUP_BODY_TYPES };
