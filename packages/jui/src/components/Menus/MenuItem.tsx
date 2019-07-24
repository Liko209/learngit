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
  secondaryAction?: JSX.Element;
  automationId?: string;
  maxWidth?: number;
  hasSecondaryAction: boolean;
} & MuiMenuItemProps;

const StyledMuiListItemIcon = styled(MuiListItemIcon)`
  && {
    margin-right: ${spacing(2)};
    ${typography('subheading1')};
    color: ${grey('700')};
  }
`;
const WrappedMenuItem = ({
  icon,
  avatar,
  maxWidth,
  hasSecondaryAction,
  ...rest
}: JuiMenuItemProps) => <MuiMenuItem {...rest} />;

const StyledMenuItem = styled(WrappedMenuItem)`
  && {
    ${typography('caption1')};
    color: ${grey('700')};
    height: auto;
    min-height: ${height(8)};
    min-width: ${width(28)};
    max-width: ${({ maxWidth }) => maxWidth && width(maxWidth)};
    padding: ${spacing(1, 4)};
    padding-right: ${({ hasSecondaryAction }) =>
      hasSecondaryAction ? spacing(0) : 'initial'};
    box-sizing: border-box;
    &[class*='MuiListItem-secondaryAction'][role='menuitem'] {
      padding-right: ${spacing(12)};
    }

    &:hover {
      background-color: ${palette('grey', '500', 1)};
    }

    &:active {
      background-color: ${palette('primary', 'main')};
      color: ${({ theme }) =>
        theme.palette.getContrastText(palette('primary', 'main')({ theme }))};
      ${StyledMuiListItemIcon} {
        color: ${({ theme }) =>
          theme.palette.getContrastText(palette('primary', 'main')({ theme }))};
      }
    }
  }
`;

const JuiMenuItem = React.memo(
  ({
    icon,
    children,
    disabled,
    avatar,
    automationId,
    maxWidth,
    classes,
    hasSecondaryAction,
    ...rest
  }: JuiMenuItemProps) => {
    let iconElement: any;
    if (typeof icon !== 'string') {
      iconElement = icon;
    } else {
      iconElement = <JuiIconography iconSize="small">{icon}</JuiIconography>;
    }

    return (
      <StyledMenuItem
        tabIndex={0}
        data-test-automation-id={automationId}
        disabled={disabled}
        data-disabled={disabled}
        maxWidth={maxWidth}
        hasSecondaryAction={hasSecondaryAction}
        {...rest}
      >
        {icon && <StyledMuiListItemIcon>{iconElement}</StyledMuiListItemIcon>}
        {avatar && <StyledMuiListItemIcon>{avatar}</StyledMuiListItemIcon>}
        {children}
      </StyledMenuItem>
    );
  },
);

export { JuiMenuItem, JuiMenuItemProps, StyledMenuItem };
