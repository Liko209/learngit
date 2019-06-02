/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-19 13:26:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PinnedItemViewProps } from './types';
import { observer } from 'mobx-react';
import { JuiPinnedItem } from 'jui/pattern/RightShelf/PinnedItem';
import {
  postParser,
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';

@observer
class PinnedItemView extends Component<PinnedItemViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  render() {
    const { id, icon, text, isFile } = this.props;
    return (
      <JuiPinnedItem
        id={id}
        icon={icon}
        text={postParser(text, {
          fileName: isFile,
          keyword: this.context.keyword,
        })}
        isFile={isFile}
      />
    );
  }
}

export { PinnedItemView };
