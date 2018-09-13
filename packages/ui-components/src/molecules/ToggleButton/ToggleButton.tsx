/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 15:41:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SwitchProps } from '@material-ui/core/Switch';
import * as Jui from './style';

type IProps = {
  disabled?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
};

const JuiToggleButton: React.SFC<SwitchProps> = (props: IProps) => {
  const { disabled, onChange } = props;

  return (
    <Jui.ToggleButton
      classes={{
        root: 'custom-root',
        switchBase: 'custom-switchBase',
        icon: 'custom-icon',
        bar: 'custom-bar',
        checked: 'custom-checked',
        disabled: 'custom-disabled',
      }}
      onChange={onChange}
      color="primary"
      disabled={disabled}
      disableRipple={true}
    />
  );
};

export default JuiToggleButton;
