/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { WithNamespaces } from 'react-i18next';

type ProfileHeaderViewProps = WithNamespaces & {
  title?: string;
  destroy: () => void;
  groupId: number;
};
type ProfileHeaderProps = {
  title?: string;
  id: number;
  destroy: () => void;
};
export { ProfileHeaderViewProps, ProfileHeaderProps };
