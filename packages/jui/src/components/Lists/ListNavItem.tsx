/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 15:21:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled, { keyframes } from '../../foundation/styled-components';
import {
  spacing,
  grey,
  height,
  typography,
  palette,
} from '../../foundation/utils';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { JuiIconography } from '../../foundation/Iconography';
import tinycolor from 'tinycolor2';
import { Theme } from '../../foundation/theme/theme';
import MuiTypography from '@material-ui/core/Typography';

const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${1 - theme.palette.action.hoverOpacity};
  }
`;

type JuiListNavItemProps = MuiListItemProps & {
  type?: string;
};

const JuiListNavItemIconographyLeft = styled(JuiIconography)``;
const JuiListNavItemIconography = styled(JuiIconography)``;
const JuiListNavItemText = styled(MuiTypography)`
  && {
    pointer-events: none;
    flex: 1;
    padding: ${spacing(0, 3, 0, 2)};
    ${typography('body2')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  }
`;

const StyledNavListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2, 4, 2, 3)};
    color: ${grey('900')};
    height: ${height(11)};
    line-height: ${height(11)};
    ${typography('body2')};
  }

  &&:active {
    color: ${palette('primary', 'main')};
    background: ${palette('primary', '50')};
  }

  &&:hover {
    background-color: ${({ theme }) =>
      fade(palette('grey', '700')({ theme }), theme.opacity.p05)};
  }

  &&.selected {
    &&:hover {
      background-color: ${({ theme }) =>
        fade(palette('grey', '700')({ theme }), theme.opacity.p10)};
    }

    p {
      color: ${palette('primary', 'main')};
    }

    > ${JuiListNavItemIconographyLeft} {
      color: ${palette('primary', 'main')};
    }
  }

  && > ${JuiListNavItemIconographyLeft} {
    font-size: 20px;
    color: ${({ theme }: { theme: Theme }) =>
      tinycolor(grey('600')({ theme }))
        .setAlpha(0.4)
        .toRgbString()};
    z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  }

  && > ${JuiListNavItemIconography} {
    color: ${grey('400')};
    font-size: 20px;
    margin-bottom: -1px;
  }

  .child {
    color: ${palette('action', 'active')};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
  }

  .rippleVisible {
    color: ${({ theme }) => palette('action', 'active')({ theme })};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
    transform: scale(1);
    animation-name: ${({ theme }) => rippleEnter(theme)};
    z-index: ${({ theme }) => theme.zIndex.ripple};
  }
`;

const JuiListNavItemComponent = (props: JuiListNavItemProps) => {
  return <StyledNavListItem {...props}>{props.children}</StyledNavListItem>;
};

JuiListNavItemComponent.defaultProps = {
  button: true,
};

JuiListNavItemComponent.displayName = 'JuiListNavItem';

const JuiListNavItem = React.memo(JuiListNavItemComponent);

export {
  JuiListNavItem,
  JuiListNavItemProps,
  JuiListNavItemIconographyLeft,
  JuiListNavItemIconography,
  JuiListNavItemText,
};
