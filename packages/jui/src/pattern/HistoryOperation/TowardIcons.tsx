/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import {
  JuiIconButton,
  JuiIconButtonProps,
} from '../../components/Buttons/IconButton';
import { IconsProps, OPERATION } from './types';
import styled from '../../foundation/styled-components';
import { palette } from '../../foundation/utils';
import { fade } from '@material-ui/core/styles/colorManipulator';

const StyledIconButton = styled(JuiIconButton)<JuiIconButtonProps>`
  &&&&&.disabled .icon {
    color: ${({ theme }) =>
      fade(palette('common', 'white')({ theme }), theme.opacity['5'])};
  }
`;

class TowardIcons extends PureComponent<IconsProps> {
  private _pressTimer: NodeJS.Timer;
  private _isLongPress: boolean = false;
  constructor(props: IconsProps) {
    super(props);
    this.handlePress = this.handlePress.bind(this);
    this.handleRelease = this.handleRelease.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handlePress(event: React.TouchEvent | React.MouseEvent<any>) {
    event.persist();
    const target = event.currentTarget;
    const { onLongPress } = this.props;
    this._pressTimer = setTimeout(() => {
      this._isLongPress = true;
      onLongPress(target);
      this._isLongPress = false;
    }, 300);
  }

  handleRelease() {
    clearTimeout(this._pressTimer);
  }

  handleClick(event: React.MouseEvent<any>) {
    const { onClick } = this.props;
    if (this._isLongPress) {
      this._isLongPress = false;
      return;
    }
    onClick(event);
  }

  render() {
    const { type = OPERATION.BACK, disabled = true, tooltipTitle } = this.props;
    let iconDirection;
    let autoMationId = 'back';
    if (type === OPERATION.BACK) {
      iconDirection = 'chevron_left';
      autoMationId = 'back';
    } else {
      iconDirection = 'chevron_right';
      autoMationId = 'forward';
    }
    return (
      <StyledIconButton
        tooltipTitle={tooltipTitle}
        size="medium"
        onClick={this.handleClick}
        disabled={disabled}
        disableToolTip={disabled}
        data-test-automation-id={autoMationId}
        onMouseDown={this.handlePress}
        onMouseUp={this.handleRelease}
        color="common.white"
      >
        {iconDirection}
      </StyledIconButton>
    );
  }
}
export { TowardIcons };
