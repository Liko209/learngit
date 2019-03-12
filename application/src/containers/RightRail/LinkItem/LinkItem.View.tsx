/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { LinkItemViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { SecondaryText } from '../common/SecondaryText.View';
import { Palette } from 'jui/foundation/theme/theme';

@observer
class LinkItemView extends Component<LinkItemViewProps> {
  private _color: [keyof Palette, string] = ['grey', '500'];

  private _openLink = () => {
    const { url } = this.props;
    window.open(url, '_blank');
  }

  render() {
    const { link, personName, createdTime } = this.props;
    const textPrimary = link.title || link.url || '';
    const faviconUrl = link.faviconUrl;
    return (
      <JuiListItem
        onClick={this._openLink}
        data-test-automation-id="rightRail-link-item"
      >
        <JuiListItemIcon>
          {faviconUrl ? (
            <JuiThumbnail url={faviconUrl} />
          ) : (
            <JuiIconography iconColor={this._color}>link</JuiIconography>
          )}
        </JuiListItemIcon>
        <JuiListItemText
          primary={textPrimary}
          secondary={
            <SecondaryText personName={personName} createdTime={createdTime} />}
        />
      </JuiListItem>
    );
  }
}

export { LinkItemView };
