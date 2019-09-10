/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled, { css } from '../../foundation/styled-components';
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
  /**
   * listItem use this color to calc hover, pressed, selected, disabled  background color, default to black
   */
  baseColor?: BaseColor;
  highlighted?: boolean;
};

const WrappedListItem = React.memo(
  ({
    width,
    isInline,
    singleLine,
    baseColor,
    highlighted,
    ...rest
  }: JuiListItemProps) => <MuiListItem {...rest} />,
);

const JuiListItem = styled<JuiListItemProps>(WrappedListItem).attrs(
  ({ onClick }: JuiListItemProps) => ({
    style: { cursor: onClick ? 'pointer' : 'default' },
  }),
)`
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

    ${({ highlighted }) =>
      highlighted
        ? css`
            background-color: ${({ baseColor = 'black', theme }) =>
              palette(colorMap[baseColor][0], colorMap[baseColor][1], 0.05)({
                theme,
              })};
          `
        : ''};

    .rippleVisible {
      background-color: ${({ baseColor = 'black', theme }) =>
        palette(colorMap[baseColor][0], colorMap[baseColor][1], 0.05)({
          theme,
        })};
    }
  }
`;

JuiListItem.defaultProps = {
  singleLine: false,
  button: true,
};
JuiListItem.displayName = 'JuiListItem';

export { JuiListItem, JuiListItemProps };
