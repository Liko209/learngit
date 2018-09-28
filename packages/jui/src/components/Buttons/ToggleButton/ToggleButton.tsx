/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 15:41:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SwitchProps } from '@material-ui/core/Switch';
// import MuiTooltip from '@material-ui/core/Tooltip';
import { ToggleButton } from './styled';

type IProps = {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  disabled?: boolean;
};

export const JuiToggleButton: React.SFC<SwitchProps> = (props: IProps) => {
  const { disabled, onChange, checked } = props;

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
    />
    // </MuiTooltip>
  );
};
