/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode } from 'react';
import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
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
  icon?: string | ReactNode;
} & MuiMenuItemProps;

const StyledMuiListItemIcon = styled(MuiListItemIcon)`
  && {
    margin-right: ${spacing(2)};
    ${typography('subheading1')};
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
      ${StyledMuiListItemIcon} {
        color: ${palette('common', 'white')};
      }
    }
  }
`;

class JuiMenuItem extends React.PureComponent<JuiMenuItemProps> {
  render() {
    const { icon, children, disabled, ...rest } = this.props;
    let iconElement: any;
    if (typeof icon !== 'string') {
      iconElement = icon;
    } else {
      iconElement = <JuiIconography iconSize="small">{icon}</JuiIconography>;
    }
    return (
      <StyledMenuItem disabled={disabled} data-disabled={disabled} {...rest}>
        {icon && <StyledMuiListItemIcon>{iconElement}</StyledMuiListItemIcon>}
        {children}
      </StyledMenuItem>
    );
  }
}

export { JuiMenuItem, JuiMenuItemProps };
