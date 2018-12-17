/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 15:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled, { css } from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/theme/theme';
import { JuiIconButton, JuiIconButtonProps } from '../IconButton/IconButton';
import {
  JuiCheckboxButton,
  JuiCheckboxButtonProps,
} from '../CheckboxButton/CheckboxButton';
import { styledComponentWrapper } from '../../../foundation/utils/styledComponentWrapper';
import { spacing } from '../../../foundation/utils/styles';

type JuiButtonBarProps = {
  overlapSize?: number;
  direction?: 'horizontal' | 'vertical';
  invisible?: boolean;
  awake?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
} & {
  className?: string;
  style?: React.CSSProperties;
};

const StyledButtonBar = styled<JuiButtonBarProps, 'div'>('div')`
  display: flex;
  flex-direction: ${({ direction }) =>
    direction === 'vertical' ? 'column' : 'row'};
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;
`;

type StyledIconButtonChild = JuiIconButtonProps &
  JuiButtonBarProps & { index?: number; componentName: string };
type StyledCheckboxButtonChild = JuiCheckboxButtonProps &
  JuiButtonBarProps & {
    index?: number;
    componentName: string;
    variant?: string;
  };
type StyledChild = StyledIconButtonChild | StyledCheckboxButtonChild;

const padding = (theme: Theme, overlapSize?: number) => {
  return overlapSize && overlapSize > 0
    ? `-${spacing(overlapSize)({ theme })}`
    : `${spacing(2)({ theme })}`;
};

const StyledChild = styledComponentWrapper<StyledChild>(
  ({ overlapSize, componentName, ...rest }: StyledChild) => {
    if (componentName === 'JuiCheckboxButton') {
      return <JuiCheckboxButton {...rest as JuiCheckboxButtonProps} />;
    }
    return <JuiIconButton {...rest as JuiIconButtonProps} />;
  },
  css`
    && {
      margin-left: ${({
        theme,
        direction = 'horizontal',
        index,
        overlapSize,
      }) =>
        direction === 'horizontal' && index ? padding(theme, overlapSize) : ''};

      margin-top: ${({ theme, direction = 'horizontal', index, overlapSize }) =>
        direction === 'vertical' && index ? padding(theme, overlapSize) : ''};
    }
  `,
);

type IButtonBar = React.SFC<JuiButtonBarProps>;
const JuiButtonBar: IButtonBar = ({ children, ...rest }) => {
  return (
    <StyledButtonBar {...rest}>
      {React.Children.toArray(children).map(
        (child: React.ReactElement<any>, index: number) => (
          <StyledChild
            key={index}
            index={index}
            componentName={(child.type as React.SFC).name}
            {...child.props}
            {...rest}
          />
        ),
      )}
    </StyledButtonBar>
  );
};

JuiButtonBar.defaultProps = {
  overlapSize: 0,
  direction: 'horizontal',
  size: 'medium',
  awake: false,
  invisible: false,
};

export { JuiButtonBar, JuiButtonBarProps };
