/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiPinnedCell } from 'jui/pattern/RightShelf/PinnedItem';
// import history from '@/history';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PinnedItemViewProps } from './types';

class PinnedItem extends Component<
  PinnedItemViewProps & RouteComponentProps<{ subPath: string }>
> {
  componentDidUpdate() {
    this.props.didUpdate();
  }
  jumpToPost = () => {
    const { post } = this.props;
    const { id } = post;
    // const groupId = Number(match.params.subPath);
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, id);
    // history.replace(`/messages/${groupId}`);
    console.log(this.props, id, '----nello');
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

const PinnedItemView = withRouter(PinnedItem);

export { PinnedItemView };
