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
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { PinnedCellViewProps, PinnedCellProps } from './types';
import { PinnedItem } from '../PinnedItem';
const MAX_ITEM_LENGTH = 3;

@observer
class PinnedCellView extends Component<PinnedCellViewProps & PinnedCellProps> {
  componentDidUpdate() {
    this.props.didLoad();
  }
  jumpToPost = () => {
    const { post } = this.props;
    const { id } = post;
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, id);
  }
  render() {
    const {
      creatorName = '',
      createTime,
      textContent,
      itemIds,
      post,
      didLoad,
    } = this.props;

    const itemLen = itemIds.length;
    return (
      <JuiPinnedCell
        onClick={this.jumpToPost}
        creator={creatorName}
        createTime={createTime}
        content={textContent}
        // items={items}
        postId={post.id}
      >
        {itemIds.slice(0, MAX_ITEM_LENGTH).map((id: number) => (
          <PinnedItem didLoad={didLoad} key={id} id={id} />
        ))}
        {itemLen > MAX_ITEM_LENGTH && (
          <JuiPinnedCellMore>
            {i18next.t('pinnedMore', { num: itemLen - MAX_ITEM_LENGTH })}
          </JuiPinnedCellMore>
        )}
      </JuiPinnedCell>
    );
  }
}

export { PinnedCellView };
