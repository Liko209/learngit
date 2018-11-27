/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { WithNamespaces } from 'react-i18next';
import { DismissProps, ProfileType } from '../types';

type ProfileHeaderViewProps = WithNamespaces & {
  title?: string;
  groupId: number;
  type: ProfileType;
} & DismissProps;
type ProfileHeaderProps = DismissProps & {
  title?: string;
  id: number;
  type: ProfileType;
};
export { ProfileHeaderViewProps, ProfileHeaderProps };
