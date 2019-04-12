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
  avatar?: JSX.Element;
  automationId?: string;
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
    height: auto;
    min-height: ${height(8)};
    min-width: ${width(28)};
    padding: ${spacing(1, 4)};
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
    const {
      icon,
      children,
      disabled,
      avatar,
      automationId,
      ...rest
    } = this.props;
    let iconElement: any;
    if (typeof icon !== 'string') {
      iconElement = icon;
    } else {
      iconElement = <JuiIconography iconSize="small">{icon}</JuiIconography>;
    }
    return (
      <StyledMenuItem
        data-test-automation-id={automationId}
        disabled={disabled}
        data-disabled={disabled}
        {...rest}
      >
        {icon && <StyledMuiListItemIcon>{iconElement}</StyledMuiListItemIcon>}
        {avatar && <StyledMuiListItemIcon>{avatar}</StyledMuiListItemIcon>}
        {children}
      </StyledMenuItem>
    );
  }
}

export { JuiMenuItem, JuiMenuItemProps };
