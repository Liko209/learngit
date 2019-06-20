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
import download from '../../../assets/jupiter-icon/icon-download.svg';
import link from '../../../assets/jupiter-icon/icon-external_link.svg';

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
                symbol={download}
              />
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        ) : (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton
                variant="plain"
                disabled={disabled}
                symbol={link}
              />
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { FileItem };
