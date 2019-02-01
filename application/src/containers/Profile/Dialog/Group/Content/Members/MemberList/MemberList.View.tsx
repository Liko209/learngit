/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiProfileDialogContentMemberList } from 'jui/pattern/Profile/Dialog';
import { JuiVirtualList, JuiVirtualCellWrapper } from 'jui/pattern/VirtualList';
import { MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
const ITEM_HEIGHT = 48;
const LIST_WIDTH = 640;
const LIST_HEIGHT = 1000;
@observer
class MemberList extends React.Component<WithNamespaces & MemberListViewProps> {
  componentWillUnmount() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }

  countOfCell() {
    const { memberIds } = this.props;
    return memberIds.length;
  }

  cellAtIndex = (index: number, style: CSSProperties) => {
    const { memberIds, id } = this.props;
    const memberId = memberIds[index];
    return memberId ? (
      <JuiVirtualCellWrapper key={index} style={style}>
        <MemberListItem key={memberId} cid={id} pid={memberId} />
      </JuiVirtualCellWrapper>
    ) : null;
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    await this.props.loadMore();
  }

  fixedCellHeight() {
    return ITEM_HEIGHT;
  }

  onScroll = (event: { scrollTop: number }) => {
    this.props.onScrollEvent(event);
  }

  render() {
    return (
      <JuiProfileDialogContentMemberList>
        <JuiVirtualList
          dataSource={this}
          isLoading={false}
          width={LIST_WIDTH}
          height={LIST_HEIGHT}
          data-test-automation-id="profileDialogMemberList"
        />
      </JuiProfileDialogContentMemberList>
    );
  }
}
const MemberListView = translate('translations')(MemberList);

export { MemberListView };
