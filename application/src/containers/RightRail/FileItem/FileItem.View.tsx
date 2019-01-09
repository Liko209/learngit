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
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { JuiIconButton } from 'jui/components/Buttons';
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
    const { disabled, icon, name, subtitle, action } = this.props;
    const { isHover } = this.state;
    return (
      <JuiListItem
        disabled={disabled}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiListItemIcon>{icon}</JuiListItemIcon>
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
                get_app
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        ) : (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton variant="plain" disabled={disabled}>
                info
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { FileItemView };
