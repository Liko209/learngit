/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 10:09:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { InputProps } from '@material-ui/core/Input';
import * as Jui from './style';

const JuiInput = (props: InputProps) => {
  const { innerRef, ...rest } = props;
  return (
    <Jui.Input
      classes={{
        underline: 'underline',
      }}
      {...rest}
    />
  );
};

export default JuiInput;
