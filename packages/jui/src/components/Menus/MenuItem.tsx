/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import { JuiListItemIcon } from '../Lists';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import {
  width,
  height,
  spacing,
  typography,
  grey,
  palette,
} from '../../foundation/utils';

type JuiMenuItemProps = {
  icon?: string;
} & MuiMenuItemProps;

const StyledJuiListItemIcon = styled(JuiListItemIcon)`
  && {
    margin-right: ${spacing(2)};
    font-size: ${({ theme }) => theme.typography.subheading1.fontSize};
    color: ${grey('700')};
  }
`;

const StyledMenuItem = styled(MuiMenuItem)`
  && {
    ${typography('caption1')};
    color: ${grey('700')};
    height: ${height(8)};
    min-width: ${width(28)};
    max-width: ${width(80)};
    line-height: ${height(8)};
    padding: ${spacing(0, 4)};
    box-sizing: border-box;

    &:hover {
      background-color: ${palette('grey', '500', 1)};
    }

    &:active {
      background-color: ${palette('primary', 'main')};
      color: ${palette('common', 'white')};
      ${StyledJuiListItemIcon} {
        color: ${palette('common', 'white')};
      }
    }
  }
`;

class JuiMenuItem extends React.Component<JuiMenuItemProps> {
  render() {
    const { icon, children, disabled, ...rest } = this.props;
    return (
      <StyledMenuItem disabled={disabled} data-disabled={disabled} {...rest}>
        {icon && (
          <StyledJuiListItemIcon>
            <JuiIconography fontSize="inherit">{icon}</JuiIconography>
          </StyledJuiListItemIcon>
        )}
        {children}
      </StyledMenuItem>
    );
  }
}

export { JuiMenuItem, JuiMenuItemProps };
