/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiPinnedCell } from 'jui/pattern/RightShelf/PinnedItem';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { PinnedItemViewProps } from './types';

class PinnedItemView extends Component<PinnedItemViewProps> {
  componentDidUpdate() {
    this.props.didUpdate();
  }
  jumpToPost = () => {
    const { post } = this.props;
    const { id } = post;
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, id);
  }
  render() {
    const { creatorName = '', createTime, textContent, items } = this.props;
    return (
      <JuiPinnedCell
        onClick={this.jumpToPost}
        creator={creatorName}
        createTime={createTime}
        content={textContent}
        items={items}
      />
    );
  }
}

export { PinnedItemView };
