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
import styled, { css } from '../../foundation/styled-components';
import {
  width,
  height,
  spacing,
  typography,
  grey,
  palette,
} from '../../foundation/utils';

// type issue, so add button, https://github.com/mui-org/material-ui/issues/14971
type MuiListItemPropsFixed = MuiMenuItemProps & { button?: any };

type MenuItemSize = 'large' | 'medium';

type JuiMenuItemProps = {
  icon?: string | ReactNode;
  avatar?: React.ReactElement;
  secondaryAction?: JSX.Element;
  automationId?: string;
  maxWidth?: number;
  searchString?: string;
  hasSecondaryAction?: boolean;
  highlighted?: boolean;
  size?: MenuItemSize;
} & MuiListItemPropsFixed;

const StyledMuiListItemIcon = styled(MuiListItemIcon)`
  && {
    min-width: unset;
    margin-right: ${spacing(2)};
    ${typography('subheading1')};
    color: ${grey('700')};
  }
`;
const FilteredMenuItem = React.forwardRef(
  (
    {
      icon,
      avatar,
      maxWidth,
      searchString,
      hasSecondaryAction,
      highlighted,
      size,
      ...rest
    }: JuiMenuItemProps,
    ref,
  ) => <MuiMenuItem ref={ref as any} {...rest} />,
);

const highlightedStyle = css`
  background-color: ${palette('grey', '500', 1)};
`;

const StyledMenuItem = styled(FilteredMenuItem)`
  && {
    padding: ${({ size, theme }) =>
      size === 'large' ? spacing(2, 5)({ theme }) : spacing(1, 4)({ theme })};
    ${typography('caption1')};
    color: ${grey('700')};
    height: auto;
    min-height: ${height(8)};
    min-width: ${width(28)};
    max-width: ${({ maxWidth }) => maxWidth && width(maxWidth)};
    box-sizing: border-box;

    &:focus {
      background-color: ${palette('grey', '0', 0.12)};
    }

    &:hover {
      ${highlightedStyle};
    }

    ${({ highlighted }) => (highlighted ? highlightedStyle : '')}

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
  React.forwardRef(
    (
      {
        icon,
        children,
        disabled,
        avatar,
        automationId,
        maxWidth,
        classes,
        hasSecondaryAction,
        size = 'medium',
        ...rest
      }: JuiMenuItemProps,
      ref,
    ) => {
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
          ref={ref}
          size={size}
          {...rest}
        >
          {icon && <StyledMuiListItemIcon>{iconElement}</StyledMuiListItemIcon>}
          {avatar && <StyledMuiListItemIcon>{avatar}</StyledMuiListItemIcon>}
          {children}
        </StyledMenuItem>
      );
    },
  ),
);

export { JuiMenuItem, JuiMenuItemProps, StyledMenuItem, StyledMuiListItemIcon };
