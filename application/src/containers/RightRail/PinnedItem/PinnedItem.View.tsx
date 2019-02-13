/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PinnedItemViewProps } from './types';
import { JuiPinnedCell } from 'jui/pattern/RightShelf/PinnedItem';

class PinnedItemView extends Component<PinnedItemViewProps> {
  componentDidUpdate() {
    this.props.didUpdate();
  }
  xx = () => {
    console.log('---nello');
  }
  render() {
    const { creatorName = '', createTime, textContent, items } = this.props;
    return (
      <JuiPinnedCell
        onClick={this.xx}
        creator={creatorName}
        createTime={createTime}
        content={textContent}
        items={items}
      />
    );
  }
}

export { PinnedItemView };
