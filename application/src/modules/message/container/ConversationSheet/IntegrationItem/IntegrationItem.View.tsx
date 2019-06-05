/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:54:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { IntegrationItemViewProps } from './types';
import { observer } from 'mobx-react';
import { JuiIntegrationItemView } from 'jui/pattern/ConversationItemCard/IntegrationItem';
import { IntegrationItem } from 'sdk/module/item/entity';
import {
  postParser,
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';
@observer
class IntegrationItemView extends Component<IntegrationItemViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  render() {
    const { items } = this.props;
    return items.map((item: IntegrationItem) => (
      <JuiIntegrationItemView
        title={postParser(item.title || '', {
          html: true,
          keyword: this.context.keyword,
        })}
        body={postParser(item.body || '', {
          html: true,
          keyword: this.context.keyword,
        })}
        key={item.id}
      />
    ));
  }
}

export { IntegrationItemView };
