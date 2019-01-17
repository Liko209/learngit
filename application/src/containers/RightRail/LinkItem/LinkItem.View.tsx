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
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { LinkItemViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';

class LinkItemView extends Component<LinkItemViewProps> {
  private _renderSecondaryText = () => {
    const { personName, createdTime } = this.props;
    return (
      <JuiListItemSecondaryText>
        <JuiListItemSecondarySpan text={personName} isEllipsis={true} />
        &nbsp;·&nbsp;
        <JuiListItemSecondarySpan text={createdTime} />
      </JuiListItemSecondaryText>
    );
  }

  private _openLink = () => {
    const { url } = this.props;
    window.open(url, '_blank');
  }

  render() {
    const { link } = this.props;
    const textPrimary = link.title || link.url || '';
    const faviconUrl = link.faviconUrl;
    return (
      <JuiListItem onClick={this._openLink}>
        <JuiListItemIcon>
          {faviconUrl ? (
            <JuiThumbnail url={faviconUrl} />
          ) : (
            <JuiIconography fontSize="large">link</JuiIconography>
          )}
        </JuiListItemIcon>
        <JuiListItemText
          primary={textPrimary}
          secondary={this._renderSecondaryText()}
        />
      </JuiListItem>
    );
  }
}

export { LinkItemView };
