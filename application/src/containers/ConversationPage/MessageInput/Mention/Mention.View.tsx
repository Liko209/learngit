/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { MentionViewProps } from './types';
import { JuiMentionPanel } from 'jui/pattern/MessageInput/Mention/MentionPanel';
import { JuiMentionPanelSection } from 'jui/pattern/MessageInput/Mention/MentionPanelSection';
import { JuiMentionPanelSectionHeader } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionHeader';
import { CONVERSATION_TYPES } from '@/constants';
import ReactResizeDetector from 'react-resize-detector';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';
import { MentionItem } from './MentionItem';

const ITEM_HEIGHT = 40; // jui/pattern/MessageInput/Mention/MentionPanelSectionItem

@observer
class MentionViewComponent extends Component<MentionViewProps & WithNamespaces>
  implements IVirtualListDataSource<any, number> {
  _listRef: RefObject<JuiVirtualList<number, number>> = createRef();

  get(index: number) {
    return this.props.ids[index - 1];
  }

  size() {
    return this.props.ids.length + 1;
  }

  total() {
    return this.props.total;
  }

  hasMore() {
    return this.size() !== this.total();
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    await this.props.loadMore(startIndex, stopIndex);
  }

  rowRenderer = (cellProps: JuiVirtualCellProps<number>) => {
    const {
      t,
      groupType,
      searchTerm,
      currentIndex,
      selectHandler,
    } = this.props;
    const { item, index, style } = cellProps;
    if (index === 0) {
      return groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ? null : (
        <JuiMentionPanelSectionHeader
          key={0}
          title={t(
            searchTerm && searchTerm.trim()
              ? 'message.suggestedPeople'
              : 'message.teamMembers',
          )}
        />
      );
    }
    const top: number = Number(style.top);
    const newStyle = {
      ...style,
      top: top - 8,
    };
    return (
      <JuiVirtualCellWrapper key={item} style={newStyle}>
        <MentionItem
          id={item}
          index={index}
          currentIndex={currentIndex}
          selectHandler={selectHandler}
        />
      </JuiVirtualCellWrapper>
    );
  }

  componentDidUpdate(prevProps: MentionViewProps) {
    // Typical usage (don't forget to compare props):
    const { currentIndex, total } = this.props;
    if (currentIndex !== prevProps.currentIndex) {
      this._listRef.current && this._listRef.current.scrollToCell(currentIndex);

      console.log(currentIndex, total, '----nello');
    }
  }

  render() {
    const {
      open,
      ids,
      // currentIndex,
      // t,
      // searchTerm,
      // groupType,
      // selectHandler,
      isEditMode,
    } = this.props;
    console.log(open, ids.length, '---nello  length');
    if (open && ids.length > 0) {
      return (
        <JuiMentionPanel isEditMode={isEditMode}>
          <ReactResizeDetector handleHeight={true} handleWidth={true}>
            {(width: number, height: number = 272) => {
              console.log(width, height, '---nello');

              return (
                <JuiMentionPanelSection>
                  <JuiVirtualList
                    ref={this._listRef}
                    dataSource={this}
                    overscan={5}
                    rowRenderer={this.rowRenderer}
                    width={width}
                    height={height}
                    fixedCellHeight={ITEM_HEIGHT}
                    data-test-automation-id="mention-list"
                  />
                </JuiMentionPanelSection>
              );
            }}
          </ReactResizeDetector>
        </JuiMentionPanel>

        /* <JuiMentionPanel isEditMode={isEditMode}>
            <JuiMentionPanelSection>
              {groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ? null : (
                <JuiMentionPanelSectionHeader
                  title={t(
                    searchTerm && searchTerm.trim()
                      ? 'message.suggestedPeople'
                      : 'message.teamMembers',
                  )}
                />
              )}
              {members.map(
                (
                  { displayName, id }: { displayName: string; id: number },
                  index: number,
                ) => (
                  <JuiMentionPanelSectionItem
                    Avatar={this._Avatar(id)}
                    displayName={displayName}
                    key={id}
                    selected={currentIndex === index}
                    selectHandler={selectHandler(index)}
                  />
                ),
              )}
            </JuiMentionPanelSection>
          </JuiMentionPanel> */
      );
    }
    return null;
  }
}

const MentionView = translate('translations')(MentionViewComponent);

export { MentionView };
