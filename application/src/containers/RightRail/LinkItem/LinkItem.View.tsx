/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemTextWithDate,
} from 'jui/components/Lists';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { LinkItemViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';

class LinkItemView extends Component<LinkItemViewProps> {
  render() {
    const { link, textSecondary } = this.props;
    const textPrimary = link.title || link.url || '';
    const faviconUrl = link.faviconUrl;
    return (
      <JuiListItem>
        <JuiListItemIcon>
          {faviconUrl ? (
            <JuiThumbnail url={faviconUrl} />
          ) : (
            <JuiIconography>link</JuiIconography>
          )}
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={textPrimary} />}
          secondary={<JuiListItemTextWithDate text={textSecondary} />}
        />
      </JuiListItem>
    );
  }
}

export { LinkItemView };
