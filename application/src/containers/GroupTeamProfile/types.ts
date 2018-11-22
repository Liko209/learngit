/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';
import { WithNamespaces } from 'react-i18next';

enum GROUP_TYPES {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
}
type GroupTeamProps = WithNamespaces & {
  groupModel: GroupModel;
  description: string;
  displayName: string;
  destroy: () => void;
};

export { GroupTeamProps, GROUP_TYPES };
