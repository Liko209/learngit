/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MemberListView } from './MemberList.View';
import { MemberListViewModel } from './MemberList.ViewModel';
import { LoadingMorePlugin, LoadingPlugin } from '@/plugins';
import { MemberListProps } from './types';

const MemberList = buildContainer<MemberListProps>({
  View: MemberListView,
  ViewModel: MemberListViewModel,
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

export { MemberList, MemberListProps };
