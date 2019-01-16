/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 11:07:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { t } from 'i18next';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { JuiIconButton } from 'jui/components/Buttons';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { ImageItemProps } from './types';

class ImageItemView extends Component<ImageItemProps> {
  state = {
    isHover: false,
  };
  handleMouseEnter = () => {
    this.setState({ isHover: true });
  }
  handleMouseLeave = () => {
    this.setState({ isHover: false });
  }

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

  render() {
    const { file, url } = this.props;
    const { name, downloadUrl } = file;
    const { isHover } = this.state;

    return (
      <JuiListItem
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiListItemIcon>
          <JuiThumbnail url={url} />
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={name} />}
          secondary={this._renderSecondaryText()}
        />
        {isHover && (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton
                component="a"
                download={true}
                href={downloadUrl}
                variant="plain"
                tooltipTitle={t('download')}
              >
                download
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { ImageItemView };
