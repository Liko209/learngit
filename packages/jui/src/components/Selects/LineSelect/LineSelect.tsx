/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-25 09:56:25
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiTextField } from '../../../components/Forms';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import { grey, typography } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';
import { MenuProps } from '@material-ui/core/Menu';

type JuiLineSelectProps = TextFieldProps & {
  label?: string;
  automationId?: string;
  menuProps?: Partial<MenuProps>;
  children: JSX.Element[];
};

const StyledSelect = styled(JuiTextField)`
  && {
    width: 100%;
    .icon {
      color: ${grey('900')};
    }
    .selectMenu {
      ${typography('body1')};
      color: ${grey('900')};
    }
  }
` as typeof MuiTextField;

const JuiLineSelect = React.memo((props: JuiLineSelectProps) => {
  const { children, automationId, label, menuProps, ...rest } = props;
  return (
    <StyledSelect
      label={label}
      data-test-automation-id={automationId}
      select={true}
      SelectProps={{
        MenuProps: menuProps,
        classes: { icon: 'icon', selectMenu: 'selectMenu' },
      }}
      {...rest}
    >
      {children}
    </StyledSelect>
  );
});

export { JuiLineSelect, JuiLineSelectProps, MenuProps };
