/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MembersListView } from './MembersList.View';
import { MembersListViewModel } from './MembersList.ViewModel';
import { LoadingMorePlugin, LoadingPlugin } from '@/plugins';
import { MemberListProps } from './types';

const MembersList = buildContainer<MemberListProps>({
  View: MembersListView,
  ViewModel: MembersListViewModel,
  plugins() {
    return {
      loadingMorePlugin: new LoadingMorePlugin({
        thresholdDown: 300,
        initialScrollTop: 0,
        stickTo: 'top',
      }),
      loadingPlugin: new LoadingPlugin(),
    };
  },
});

export { MembersList };
