/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { JuiProfileDialogContentMemberList } from 'jui/pattern/Profile/Dialog';
import { JuiVirtualList, JuiVirtualCellWrapper } from 'jui/pattern/VirtualList';
import { MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
const ITEM_HEIGHT = 48;
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
    const { memberIds } = this.props;
    const memberIdsLength = memberIds.length;
    const dialogHeight =
      memberIdsLength >= 8 ? 8 * ITEM_HEIGHT : ITEM_HEIGHT * memberIdsLength;
    return (
      <ReactResizeDetector handleWidth={true} handleHeight={true}>
        {(width: number = 0, height: number = 0) => (
          <JuiProfileDialogContentMemberList>
            <JuiVirtualList
              dataSource={this}
              isLoading={false}
              width={width}
              height={height || dialogHeight}
              data-test-automation-id="profileDialogMemberList"
            />
          </JuiProfileDialogContentMemberList>
        )}
      </ReactResizeDetector>
    );
  }
}
const MemberListView = translate('translations')(MemberList);

export { MemberListView };
