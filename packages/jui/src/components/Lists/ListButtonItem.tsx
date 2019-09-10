/*
 * @Author: Spike.Yang
 * @Date: 2019-07-23 09:33:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import MuiTypography from '@material-ui/core/Typography';
import { fade } from '@material-ui/core/styles/colorManipulator';
import styled from '../../foundation/styled-components';
import { JuiIconography, IconColor } from '../../foundation/Iconography';
import {
  spacing,
  width,
  palette,
  height,
  shape,
  grey,
  typography,
} from '../../foundation/utils';

type JuiListButtonItemProps = MuiListItemProps & {
  width?: number;
  selected: boolean;
  icon: string;
  title: string;
  iconColor: IconColor;
};

const WrappedListItem = React.memo(
  ({ width, iconColor, title, icon, ...rests }: JuiListButtonItemProps) => (
    <MuiListItem button={true as any} {...rests} />
  ),
);

const StyledJuiIconography = styled(JuiIconography)``;

const StyledItemText = styled(MuiTypography)`
  && {
    padding: ${spacing(0, 0, 0, 2)};
    ${typography('body1')};
    color: ${({ theme }) => theme.palette.grey['900']};
  }
`;

const StyledListItem = styled<JuiListButtonItemProps>(WrappedListItem)`
  && {
    padding: ${spacing(3, 4)};
    height: ${height(9)};
    width: ${props => (props.width ? width(props.width) : '100%')};
    border: ${shape('border4')};
    margin-bottom: ${spacing(2)};
    border-radius: ${shape('borderRadius')};
    background-color: ${({ theme }) => theme.palette.background.paper};
  }

  &&.MuiListItem-button {
    transition: none;
  }

  &&:hover {
    background-color: ${({ theme }) =>
      fade(grey('700')({ theme }), theme.opacity['1'] / 2)};
  }

  &&:last-child {
    margin-bottom: 0;
  }

  &&&:focus,
  &&&.selected {
    background-color: ${palette('primary', 'main')};
    border: none;

    & > ${StyledItemText} {
      color: ${({ theme }) => theme.palette.common.white};
    }

    & > ${StyledJuiIconography} svg {
      fill: ${({ theme }) => theme.palette.common.white};
    }
  }
`;

const JuiListButtonItemComponent = (props: JuiListButtonItemProps) => (
  <StyledListItem classes={{ selected: 'selected' }} {...props}>
    <StyledJuiIconography iconColor={props.iconColor} iconSize="medium">
      {props.icon}
    </StyledJuiIconography>
    <StyledItemText>{props.title}</StyledItemText>
  </StyledListItem>
);

JuiListButtonItemComponent.displayName = 'JuiListButtonItem';

const JuiListButtonItem = React.memo(JuiListButtonItemComponent);

export { JuiListButtonItem, JuiListButtonItemProps };
