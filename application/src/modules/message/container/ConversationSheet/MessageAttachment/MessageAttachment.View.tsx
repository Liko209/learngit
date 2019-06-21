/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:54:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { MessageAttachmentViewProps } from './types';
import { observer } from 'mobx-react';
import {
  JuiMessageAttachment,
  AttachmentItemProps,
  FieldProps,
} from 'jui/pattern/ConversationItemCard/MessageAttachment';
import { InteractiveMessageItem } from 'sdk/module/item/entity';
import {
  postParser,
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';

@observer
class MessageAttachmentView extends Component<MessageAttachmentViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;

  parseField(field: FieldProps) {
    const fieldKeys: (keyof FieldProps)[] = ['title', 'value'];
    fieldKeys.forEach(key => {
      const value = field[key];
      if (typeof value === 'string') {
        field[key] = postParser(value, {
          html: true,
          keyword: this.context.keyword,
        });
      }
    });
  }

  render() {
    const { items } = this.props;
    if (items.length > 0) {
      const keys: (keyof AttachmentItemProps)[] = [
        'footer',
        'pretext',
        'author_name',
        'title',
        'text',
      ];
      return items.map((item: InteractiveMessageItem) => {
        if (item.attachments && item.attachments.length) {
          item.attachments.forEach(attachment => {
            keys.forEach(key => {
              const value = attachment[key];
              if (typeof value === 'string') {
                attachment[key] = postParser(value, {
                  html: true,
                  keyword: this.context.keyword,
                });
              }
            });
            attachment.fields &&
              attachment.fields.forEach(field => this.parseField(field));
          });
        }
        return <JuiMessageAttachment {...item} key={item.id} />;
      });
    }
    return null;
  }
}

export { MessageAttachmentView };
