/*
 * @Author: ken.li
 * @Date: 2019-06-02 16:43:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { ColonEmojiViewProps } from './types';
import { JuiMentionPanel } from 'jui/pattern/MessageInput/Mention/MentionPanel';
import { JuiMentionPanelSection } from 'jui/pattern/MessageInput/Mention/MentionPanelSection';
import { EmojiItem } from './EmojiItem';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from 'jui/components/VirtualizedList';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { ITEM_HEIGHT, MAX_ITEM_NUMBER } from './constants';

type State = {
  width?: number;
  height?: number;
};

@observer
class ColonEmojiView extends Component<ColonEmojiViewProps, State> {
  state: State = { width: 2000, height: ITEM_HEIGHT };
  _listRef: RefObject<JuiVirtualizedListHandles> = createRef();

  private _handleSizeUpdate = (size: Size) => {
    const memberIdsLength = this.props.ids.length;
    const colonEmojiHeight =
      memberIdsLength >= MAX_ITEM_NUMBER
        ? MAX_ITEM_NUMBER * ITEM_HEIGHT
        : ITEM_HEIGHT * memberIdsLength;
    const width = size.width;
    const height = colonEmojiHeight;

    this.setState({ height, width });
  }

  componentDidUpdate(prevProps: ColonEmojiViewProps) {
    const { currentIndex } = this.props;
    currentIndex !== prevProps.currentIndex &&
      this._listRef.current &&
      this._listRef.current.scrollToIndex(currentIndex);
  }

  render() {
    const {
      open,
      ids,
      isEditMode,
      members,
      currentIndex,
      selectHandler,
    } = this.props;
    const memberIdsLength = ids.length;
    if (open && memberIdsLength > 0) {
      const colonEmojiHeight =
        memberIdsLength >= MAX_ITEM_NUMBER
          ? MAX_ITEM_NUMBER * ITEM_HEIGHT
          : ITEM_HEIGHT * memberIdsLength;
      return (
        <JuiMentionPanel automationId="ColonEmojiPanel" isEditMode={isEditMode}>
          <JuiMentionPanelSection>
            <JuiSizeDetector handleSizeChanged={this._handleSizeUpdate} />
            <JuiVirtualizedList
              minRowHeight={ITEM_HEIGHT}
              ref={this._listRef}
              height={colonEmojiHeight}
              data-test-automation-id="colon-emoji-list"
            >
              {members.map((emoji: any, index: number) => {
                return (
                  <EmojiItem
                    displayId={emoji.displayId}
                    key={emoji.id}
                    id={emoji.id}
                    index={index}
                    currentIndex={currentIndex}
                    selectHandler={selectHandler}
                  />
                );
              })}
            </JuiVirtualizedList>
          </JuiMentionPanelSection>
        </JuiMentionPanel>
      );
    }
    return null;
  }
}

export { ColonEmojiView };
