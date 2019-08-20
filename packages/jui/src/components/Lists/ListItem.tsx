/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled from '../../foundation/styled-components';
import { spacing, width, palette } from '../../foundation/utils';
import { Palette } from '../../foundation/theme/theme';

// type issue, so add button, https://github.com/mui-org/material-ui/issues/14971
type MuiListItemPropsFixed = MuiListItemProps & {
  button?: any;
};

type BaseColor = 'primary' | 'secondary' | 'black';

const colorMap: {
  [x: string]: [keyof Palette, string];
} = {
  primary: ['primary', 'main'],
  secondary: ['secondary', 'main'],
  black: ['common', 'black'],
};

type JuiListItemProps = MuiListItemPropsFixed & {
  width?: number;
  isInline?: boolean;
  singleLine?: boolean;
  disableButton?: boolean;
  /**
   * listItem use this color to calc hover, pressed, selected, disabled  background color, default to black
   */
  baseColor?: BaseColor;
};

const WrappedListItem = React.memo(
  ({
    width,
    isInline,
    singleLine,
    disableButton,
    ...rests
  }: JuiListItemProps) => <MuiListItem {...rests} />,
);

const StyledListItem = styled<JuiListItemProps>(({ baseColor, ...rest }) => (
  <WrappedListItem {...rest} />
))`
  && {
    padding: ${spacing(2)};
    width: ${props => (props.width ? width(props.width) : '100%')};
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    padding-left: ${props => (props.singleLine ? spacing(4) : spacing(2))};
    color: ${({ baseColor = 'black', theme }) =>
      palette(colorMap[baseColor][0], colorMap[baseColor][1])({
        theme,
      })};
    &.Mui-focusVisible {
      background-color: ${({ baseColor = 'black', theme }) =>
        palette(colorMap[baseColor][0], colorMap[baseColor][1], 0.1)({
          theme,
        })};
    }
    &:hover {
      background-color: ${({ baseColor = 'black', theme }) =>
        palette(colorMap[baseColor][0], colorMap[baseColor][1], 0.05)({
          theme,
        })};
    }
    .rippleVisible {
      background-color: ${({ baseColor = 'black', theme }) =>
        palette(colorMap[baseColor][0], colorMap[baseColor][1], 0.05)({
          theme,
        })};
    }
  }
`;

const JuiListItemComponent = (props: JuiListItemProps) => (
  <StyledListItem button={!props.disableButton && true} {...props}>
    {props.children}
  </StyledListItem>
);

JuiListItemComponent.defaultProps = {
  singleLine: false,
};
JuiListItemComponent.displayName = 'JuiListItem';

const JuiListItem = React.memo(JuiListItemComponent);

export { JuiListItem, JuiListItemProps };
