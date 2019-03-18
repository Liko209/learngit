/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { JuiProfileDialogContentMemberList } from 'jui/pattern/Profile/Dialog';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';
import { MemberListProps, MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
const ITEM_HEIGHT = 48;
const MAX_ITEM_NUMBER = 8;

@observer
class MemberList
  extends React.Component<
    WithNamespaces & MemberListProps & MemberListViewProps
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
    const { sortedAllMemberIds } = this.props;
    const memberIdsLength = sortedAllMemberIds.length;
    const dialogHeight =
      memberIdsLength >= MAX_ITEM_NUMBER
        ? MAX_ITEM_NUMBER * ITEM_HEIGHT
        : ITEM_HEIGHT * memberIdsLength;
    return (
      <ReactResizeDetector handleWidth={true} handleHeight={true}>
        {(width: number = 0, height: number = dialogHeight) => {
          let virtualListHeight =
            memberIdsLength >= MAX_ITEM_NUMBER ? height : dialogHeight;
          if (virtualListHeight === 0) {
            virtualListHeight = dialogHeight;
          }
          return (
            <JuiProfileDialogContentMemberList style={{ height: dialogHeight }}>
              <JuiVirtualList
                dataSource={this}
                overscan={5}
                rowRenderer={this.rowRenderer}
                width={width}
                height={virtualListHeight}
                fixedCellHeight={ITEM_HEIGHT}
                onScroll={this.onScroll}
                data-test-automation-id="profileDialogMemberList"
              />
            </JuiProfileDialogContentMemberList>
          );
        }}
      </ReactResizeDetector>
    );
  }
}
const MemberListView = translate('translations')(MemberList);

export { MemberListView };
