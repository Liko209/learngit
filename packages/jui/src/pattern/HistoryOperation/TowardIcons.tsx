/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import { IconsProps, OPERATION } from './types';

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
    },                            300);
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
    if (type === OPERATION.BACK) {
      iconDirection = 'chevron_left';
    } else {
      iconDirection = 'chevron_right';
    }
    return (
      <JuiIconButton
        tooltipTitle={tooltipTitle}
        size="small"
        onClick={this.handleClick}
        disabled={disabled}
        disableToolTip={disabled}
        data-test-automation-id={tooltipTitle}
        onMouseDown={this.handlePress}
        onMouseUp={this.handleRelease}
      >
        {iconDirection}
      </JuiIconButton>
    );
  }
}
export { TowardIcons };
