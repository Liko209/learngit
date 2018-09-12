/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 15:41:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SwitchProps } from '@material-ui/core/Switch';
import * as Jui from './style';

interface IProps {
  disabled?: boolean;
}

const JuiSwitchButton: React.SFC<SwitchProps> = (props: IProps) => {
  const { disabled } = props;

  return (
    <Jui.SwitchButton
      classes={{
        icon: 'custom-icon',
        bar: 'custom-bar',
        checked: 'custom-checked',
        disabled: 'custom-disabled',
      }}
      color="primary"
      disabled={disabled}
      disableRipple={true}
    />
  );
};

export default JuiSwitchButton;
