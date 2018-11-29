/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { WithNamespaces } from 'react-i18next';
import { ProfileType } from '../types';

type ProfileHeaderViewProps = WithNamespaces & {
  id: number;
  name: string;
  description?: string;
  type: ProfileType;
  dismiss: () => void;
  isShowMessageButton: boolean;
};

type ProfileBodyProps = {
  id: number;
  dismiss: () => void;
  type?: ProfileType;
};

export { ProfileHeaderViewProps, ProfileBodyProps };
