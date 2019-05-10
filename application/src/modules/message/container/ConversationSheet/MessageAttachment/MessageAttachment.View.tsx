/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:54:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { MessageAttachmentViewProps } from './types';
import { observer } from 'mobx-react';
import { JuiMessageAttachment } from 'jui/pattern/ConversationItemCard/MessageAttachment';
import { InteractiveMessageItem } from 'sdk/module/item/entity';

@observer
class MessageAttachmentView extends Component<MessageAttachmentViewProps> {
  render() {
    const { items } = this.props;
    if (items.length > 0) {
      return items.map((item: InteractiveMessageItem) => (
        <JuiMessageAttachment {...item} key={item.id} />
      ));
    }
    return null;
  }
}

export { MessageAttachmentView };
