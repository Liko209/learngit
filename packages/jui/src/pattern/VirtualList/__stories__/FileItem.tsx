/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 19:41:26
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import {
  JuiListItemText,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from '../../../components/Lists';
import { JuiIconButton } from '../../../components/Buttons';
import { JuiThumbnail } from '../../../components/Thumbnail';
import { FileItemProps } from './types';

class FileItem extends PureComponent<FileItemProps> {
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
    const { disabled, icon, name, subtitle, action } = this.props;
    const { isHover } = this.state;
    return (
      <JuiListItem
        disabled={disabled}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiListItemIcon>
          {icon || <JuiThumbnail iconType="pdf" />}
        </JuiListItemIcon>
        <JuiListItemText primary={name} secondary={subtitle} />
        {isHover ? (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton
                variant="plain"
                tooltipTitle="Download"
                disabled={disabled}
                onClick={action}
              >
                download
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        ) : (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton variant="plain" disabled={disabled}>
                link
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { FileItem };
