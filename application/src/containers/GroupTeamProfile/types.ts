/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { WithNamespaces } from 'react-i18next';
import { CONVERSATION_TYPES } from '@/constants';

type ProfileType = CONVERSATION_TYPES;
type DismissProps = {
  dismiss: () => void;
};
type GroupTeamProps = WithNamespaces & {
  id: number;
  type: ProfileType;
  isGroupOrTeam: boolean;
} & DismissProps;
export { GroupTeamProps, ProfileType, DismissProps };
