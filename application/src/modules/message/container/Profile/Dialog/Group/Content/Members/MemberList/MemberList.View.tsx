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
import { JuiVirtualizedList } from 'jui/components/VirtualizedList';
import { JuiMemberListEmptyView } from 'jui/pattern/EmptyScreen';
import empty from './noresult.svg';
import { MemberListProps, MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import { ITEM_HEIGHT, SHADOW_HEIGHT, EMPTY_HEIGHT } from '../constants';

const EmptyView = withDelay(JuiMemberListEmptyView);
@observer
class MemberList extends React.Component<
  WithTranslation & MemberListProps & MemberListViewProps
> {
  componentWillUnmount() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }

  rowRenderer = (memberId: number) => {
    const { id } = this.props;
    return <MemberListItem key={memberId} cid={id} pid={memberId} />;
  }

  onScroll = (event: React.UIEvent<HTMLElement>) => {
    this.props.onScrollEvent(event);
  }

  render() {
    const { height, t, showEmpty, filteredMemberIds } = this.props;
    const minHeight = showEmpty ? Math.max(EMPTY_HEIGHT, height) : height;
    return (
      <JuiProfileDialogContentMemberList
        style={{ minHeight, height: minHeight }}
      >
        {showEmpty && (
          <EmptyView
            image={empty}
            subText={t('people.team.noMatchesFound')}
            delay={100}
          />
        )}
        {filteredMemberIds.length > 0 && (
          <JuiVirtualizedList
            height={height - SHADOW_HEIGHT}
            minRowHeight={ITEM_HEIGHT}
            onScroll={this.onScroll}
            data-test-automation-id="profileDialogMemberList"
          >
            {filteredMemberIds.map((id: number, index: number) => {
              return this.rowRenderer(id);
            })}
          </JuiVirtualizedList>
        )}
      </JuiProfileDialogContentMemberList>
    );
  }
}
const MemberListView = withTranslation('translations')(MemberList);

export { MemberListView };
