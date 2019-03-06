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
  sortedAllMemberIds: number[];
  filteredMemberIds: number[];
  changeSearchInputDebounce: (keywords: string) => void;
};

export { MembersProps, MembersViewProps };
