/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { MentionViewProps } from './types';
import { JuiMentionPanel } from 'jui/pattern/MessageInput/Mention/MentionPanel';
import { JuiMentionPanelSection } from 'jui/pattern/MessageInput/Mention/MentionPanelSection';
import { JuiMentionPanelSectionHeader } from 'jui/pattern/MessageInput/Mention/MentionPanelSectionHeader';
import ReactResizeDetector from 'react-resize-detector';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';
import { MentionItem } from './MentionItem';
import {
  ITEM_HEIGHT,
  MAX_ITEM_NUMBER,
  TITLE_HEIGHT,
  ITEM_DIFF,
} from './constants';

@observer
class MentionViewComponent extends Component<MentionViewProps & WithTranslation>
  implements IVirtualListDataSource<any, number> {
  _listRef: RefObject<JuiVirtualList<number, number>> = createRef();

  get(index: number) {
    const { initIndex, ids } = this.props;
    return ids[index - initIndex];
  }

  size() {
    const { initIndex, ids } = this.props;
    return ids.length + initIndex;
  }

  private _rowRenderer = (cellProps: JuiVirtualCellProps<number>) => {
    const {
      t,
      searchTerm,
      currentIndex,
      selectHandler,
      isOneToOneGroup,
    } = this.props;
    const { item, index, style } = cellProps;
    if (index === 0 && !isOneToOneGroup) {
      return (
        <JuiMentionPanelSectionHeader
          key={index}
          title={t(
            searchTerm && searchTerm.trim()
              ? 'message.suggestedPeople'
              : 'message.teamMembers',
          )}
        />
      );
    }
    const newStyle = isOneToOneGroup
      ? style
      : {
          ...style,
          top: Number(style.top) - ITEM_DIFF, // every item has 40px but title is 32px
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
    const { currentIndex } = this.props;
    if (currentIndex !== prevProps.currentIndex) {
      this._listRef.current && this._listRef.current.scrollToCell(currentIndex);
    }
  }

  render() {
    const { open, ids, isEditMode, isOneToOneGroup } = this.props;
    const memberIdsLength = ids.length;

    if (open && memberIdsLength > 0) {
      const mentionHeight =
        memberIdsLength >= MAX_ITEM_NUMBER
          ? MAX_ITEM_NUMBER * ITEM_HEIGHT
          : ITEM_HEIGHT * memberIdsLength;
      return (
        <JuiMentionPanel isEditMode={isEditMode}>
          <ReactResizeDetector handleWidth={true}>
            {({ width = 2000 }: { width: number }) => {
              return (
                <JuiMentionPanelSection>
                  <JuiVirtualList
                    ref={this._listRef}
                    dataSource={this}
                    overscan={5}
                    rowRenderer={this._rowRenderer}
                    width={width}
                    height={
                      mentionHeight + (isOneToOneGroup ? 0 : TITLE_HEIGHT)
                    }
                    fixedCellHeight={ITEM_HEIGHT}
                    data-test-automation-id="mention-list"
                  />
                </JuiMentionPanelSection>
              );
            }}
          </ReactResizeDetector>
        </JuiMentionPanel>
      );
    }
    return null;
  }
}

const MentionView = withTranslation('translations')(MentionViewComponent);

export { MentionView };
