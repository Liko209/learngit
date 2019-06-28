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
  IFieldProps,
} from 'jui/pattern/ConversationItemCard/MessageAttachment';
import {
  InteractiveMessageItem,
  InteractiveMessageItemAttachment,
} from 'sdk/module/item/entity';
import {
  postParser,
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';

@observer
class MessageAttachmentView extends Component<MessageAttachmentViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;

  parseField(field: IFieldProps) {
    const fieldKeys: (keyof IFieldProps)[] = ['title', 'value'];
    fieldKeys.forEach(key => {
      const value = field[key];
      if (typeof value === 'string') {
        (field[key] as
          | IFieldProps['title']
          | IFieldProps['value']) = postParser(value, {
          html: true,
          keyword: this.context.keyword,
        });
      }
    });
    return field;
  }

  render() {
    const { items } = this.props;
    if (items.length > 0) {
      const keys: string[] = [
        'footer',
        'pretext',
        'author_name',
        'title',
        'text',
      ];
      return items.map(
        ({ attachments, id, ...rest }: InteractiveMessageItem) => {
          const item: InteractiveMessageItem = { id, ...rest };
          item.attachments = [];
          if (attachments && attachments.length) {
            attachments.forEach((attachment: AttachmentItemProps) => {
              const clone: AttachmentItemProps = {};
              for (const key in attachment) {
                const value = attachment[key];
                clone[key] =
                  keys.includes(key) && typeof value === 'string'
                    ? postParser(value, {
                        html: true,
                        keyword: this.context.keyword,
                      })
                    : attachment[key];
              }
              if (attachment.fields) {
                clone.fields = attachment.fields.map(field =>
                  this.parseField({ ...field }),
                );
              }
              (item.attachments as InteractiveMessageItemAttachment[]).push(
                clone,
              );
            });
          }
          return <JuiMessageAttachment {...item} key={id} />;
        },
      );
    }
    return null;
  }
}

export { MessageAttachmentView };
