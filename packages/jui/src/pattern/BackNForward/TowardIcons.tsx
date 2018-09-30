/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiIconButton }  from '../../components/Buttons/IconButton';
import { IconsProps } from './types';

enum ICON_TYPES {
  LEFT = 'backward',
  RIGHT = 'forward',
}
class TowardIcons extends PureComponent<IconsProps> {
  constructor(props: IconsProps) {
    super(props);
  }
  render() {
    const {
      onBackWard,
      onForWard,
      types = 'backward',
      backDisabled = true,
      forwardDisabled = true,
      onButtonPress,
      onButtonRelease,
    } = this.props;
    let disabled;
    let handleClick;
    let iconDirection;
    if (types === ICON_TYPES.LEFT) {
      disabled = backDisabled;
      handleClick = onBackWard;
      iconDirection = 'chevron_left';
    } else {
      disabled = forwardDisabled;
      handleClick = onForWard;
      iconDirection = 'chevron_right';
    }
    return (
      <JuiIconButton
        tooltipTitle={types}
        size="small"
        onClick={handleClick}
        disabled={disabled}
        onTouchStart={onButtonPress && onButtonPress!.bind(this, types)}
        onTouchEnd={onButtonRelease}
        onMouseDown={onButtonPress && onButtonPress!.bind(this, types)}
        onMouseUp={onButtonRelease}
      >
        {iconDirection}
      </JuiIconButton>
    );
  }
}
export { TowardIcons };
