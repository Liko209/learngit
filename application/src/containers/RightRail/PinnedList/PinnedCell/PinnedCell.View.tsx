/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import i18next from 'i18next';
import { observer } from 'mobx-react';
import {
  JuiPinnedCell,
  JuiPinnedCellMore,
} from 'jui/pattern/RightShelf/PinnedItem';
import { PinnedCellViewProps, PinnedCellProps } from './types';
import { PinnedItem } from '../PinnedItem';
import { jumpToPost } from '@/common/jumpToPost';
const MAX_ITEM_LENGTH = 3;

@observer
class PinnedCellView extends Component<PinnedCellViewProps & PinnedCellProps> {
  jumpToPost = () =>
    jumpToPost({
      ...this.props.post,
      replaceHistory: true,
    })

  render() {
    const {
      creatorName = '',
      createTime,
      textContent,
      itemIds,
      post,
    } = this.props;

    const itemLen = itemIds.length;

    return (
      <JuiPinnedCell
        onClick={this.jumpToPost}
        creator={creatorName}
        createTime={createTime}
        content={textContent}
        postId={post.id}
        itemLen={itemLen}
      >
        {itemIds.slice(0, MAX_ITEM_LENGTH).map((id: number) => (
          <PinnedItem key={id} id={id} />
        ))}
        {itemLen > MAX_ITEM_LENGTH && (
          <JuiPinnedCellMore data-test-automation-id="pinned-section-more">
            {i18next.t('item.pinnedMore', { num: itemLen - MAX_ITEM_LENGTH })}
          </JuiPinnedCellMore>
        )}
      </JuiPinnedCell>
    );
  }
}

export { PinnedCellView };
