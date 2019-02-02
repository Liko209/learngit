/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 15:41:45
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { SwitchProps } from '@material-ui/core/Switch';
// import MuiTooltip from '@material-ui/core/Tooltip';
import { ToggleButton } from './styled';

type JuiToggleButtonProps = {
  checked?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  disabled?: boolean;
};

const JuiToggleButtonComponent: React.SFC<SwitchProps> = (
  props: JuiToggleButtonProps,
) => {
  const { disabled, onChange, checked, ...rest } = props;

  return (
    // <MuiTooltip title={tooltipTitle}>
    <ToggleButton
      classes={{
        root: 'custom-root',
        switchBase: 'custom-switchBase',
        icon: 'custom-icon',
        bar: 'custom-bar',
        checked: 'custom-checked',
        disabled: 'custom-disabled',
      }}
      checked={checked}
      onChange={onChange}
      color="primary"
      disabled={disabled}
      disableRipple={true}
      {...rest}
    />
    // </MuiTooltip>
  );
};
const JuiToggleButton = memo(JuiToggleButtonComponent);
export { JuiToggleButton, JuiToggleButtonProps };
