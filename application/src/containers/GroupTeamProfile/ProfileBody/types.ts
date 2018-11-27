/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { WithNamespaces } from 'react-i18next';

type ProfileHeaderViewProps = WithNamespaces & {
  id: number;
  displayName: string;
  description?: string;
  idType: number;
  destroy: () => void;
};

type ProfileBodyProps = {
  id: number;
  displayName?: string;
  destroy: () => void;
};

export { ProfileHeaderViewProps, ProfileBodyProps };
