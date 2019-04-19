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
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';
import { JuiMemberListEmptyView } from 'jui/pattern/EmptyScreen';
import empty from './noresult.svg';
import { MemberListProps, MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import { ITEM_HEIGHT, SHADOW_HEIGHT, EMPTY_HEIGHT } from '../constants';

const EmptyView = withDelay(JuiMemberListEmptyView);

@observer
class MemberList
  extends React.Component<
    WithTranslation & MemberListProps & MemberListViewProps
  >
  implements IVirtualListDataSource<number, number> {
  componentWillUnmount() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }

  get(index: number) {
    return this.props.filteredMemberIds[index];
  }

  size() {
    const { filteredMemberIds } = this.props;
    return filteredMemberIds.length;
  }

  rowRenderer = ({ style, item: memberId }: JuiVirtualCellProps<number>) => {
    const { id } = this.props;
    return (
      <JuiVirtualCellWrapper key={memberId} style={style}>
        <MemberListItem key={memberId} cid={id} pid={memberId} />
      </JuiVirtualCellWrapper>
    );
  }

  onScroll = (event: { scrollTop: number }) => {
    this.props.onScrollEvent(event);
  }

  render() {
    const { width, height, t, showEmpty } = this.props;
    const size = this.size();
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
        {size > 0 && (
          <JuiVirtualList
            dataSource={this}
            overscan={5}
            rowRenderer={this.rowRenderer}
            width={width}
            height={height - SHADOW_HEIGHT}
            fixedCellHeight={ITEM_HEIGHT}
            onScroll={this.onScroll}
            data-test-automation-id="profileDialogMemberList"
          />
        )}
      </JuiProfileDialogContentMemberList>
    );
  }
}
const MemberListView = withTranslation('translations')(MemberList);

export { MemberListView };
