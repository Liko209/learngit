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
  render() {
    const { file, url, subTitle } = this.props;
    const fileInfo = file || {};
    const { name, downloadUrl } = fileInfo;
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
          secondary={subTitle}
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
