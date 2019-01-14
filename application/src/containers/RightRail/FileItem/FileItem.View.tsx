/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
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
import { FileItemProps } from './types';

class FileItemView extends Component<FileItemProps> {
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
    const { disabled, file, fileTypeOrUrl, subTitle } = this.props;
    const fileInfo = file || {};
    const { name, downloadUrl } = fileInfo;
    const { isHover } = this.state;

    return (
      <JuiListItem
        data-test-automation-id="rightRail-file-item"
        disabled={disabled}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiListItemIcon>
          <JuiThumbnail iconType={fileTypeOrUrl.icon} url={fileTypeOrUrl.url} />
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

export { FileItemView };
