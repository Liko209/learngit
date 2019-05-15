/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ProfileDialogGroupProps,
  ProfileDialogGroupViewProps,
} from '../../types';

type MembersProps = ProfileDialogGroupProps;

type MembersViewProps = ProfileDialogGroupViewProps & {
  filteredMemberIds: number[];
  changeSearchInputDebounce: (keywords: string) => void;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
};

export { MembersProps, MembersViewProps };
