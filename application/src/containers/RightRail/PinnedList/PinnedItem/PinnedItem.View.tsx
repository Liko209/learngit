/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-19 13:26:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PinnedItemViewProps } from './types';
import { observer } from 'mobx-react';
import { JuiPinnedItem } from 'jui/pattern/RightShelf/PinnedItem';

@observer
class PinnedItemView extends Component<
  PinnedItemViewProps & { didLoad: () => void }
> {
  render() {
    const { id, icon, text, isFile } = this.props;
    return <JuiPinnedItem id={id} icon={icon} text={text} isFile={isFile} />;
  }
}

export { PinnedItemView };
