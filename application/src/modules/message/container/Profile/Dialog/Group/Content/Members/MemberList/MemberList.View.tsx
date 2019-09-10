/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiProfileDialogContentMemberList } from 'jui/pattern/Profile/Dialog';
import { withDelay } from 'jui/hoc/withDelay';
import { JuiInfiniteList } from 'jui/components/VirtualizedList';
import { withAutoSizer } from 'jui/components/AutoSizer/withAutoSizer';
import { JuiMemberListEmptyView } from 'jui/pattern/EmptyScreen';
import empty from './noresult.svg';
import { MemberListProps, MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import { ITEM_HEIGHT } from '../constants';
import { PerformanceTracer } from 'foundation/performance';
import { GROUP_PERFORMANCE_KEYS } from '../../../performanceKeys';

const InfiniteList = withAutoSizer(JuiInfiniteList);
const EmptyView = withDelay(JuiMemberListEmptyView);

@observer
class MemberList extends React.Component<
  WithTranslation & MemberListProps & MemberListViewProps
> {
  private _performanceTracer: PerformanceTracer = PerformanceTracer.start();
  componentWillUnmount() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }

  rowRenderer = (memberId: number) => {
    const { id } = this.props;
    return <MemberListItem key={memberId} cid={id} pid={memberId} />;
  };

  onScroll = (event: React.UIEvent<HTMLElement>) => {
    this.props.onScrollEvent(event);
  };

  componentDidUpdate() {
    this._performanceTracer.end({
      key: GROUP_PERFORMANCE_KEYS.UI_PROFILE_RENDER,
      count: this.props.filteredMemberIds.length,
    });
  }

  render() {
    const {
      t,
      showEmpty,
      filteredMemberIds,
      loadInitialData,
      loadMore,
      hasMore,
    } = this.props;
    return (
      <JuiProfileDialogContentMemberList>
        {showEmpty ? (
          <EmptyView
            image={empty}
            subText={t('people.team.noMatchesFound')}
            delay={100}
          />
        ) : (
          <InfiniteList
            loadInitialData={loadInitialData}
            loadMore={loadMore}
            hasMore={hasMore}
            fixedRowHeight={ITEM_HEIGHT}
            onScroll={this.onScroll}
            data-test-automation-id="profileDialogMemberList"
          >
            {filteredMemberIds.map((id: number) => this.rowRenderer(id))}
          </InfiniteList>
        )}
      </JuiProfileDialogContentMemberList>
    );
  }
}
const MemberListView = withTranslation('translations')(MemberList);

export { MemberListView };
