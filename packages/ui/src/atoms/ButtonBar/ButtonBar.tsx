/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 15:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled, { IDependencies, css } from '../../styled-components';
import { Theme } from '../../theme';
import JuiIconButton, { JuiIconButtonProps } from '../../molecules/IconButton/IconButton';
import JuiCheckboxButton, { JuiCheckboxButtonProps } from '../../molecules/CheckboxButton/CheckboxButton';
import { styledComponentWrapper } from '../../utils/styledComponentWrapper';
import { spacing } from '../../utils/styles';

type JuiButtonBarProps = {
  overlapping?: boolean;
  direction?: 'horizontal' | 'vertical';
  invisible?: boolean;
  awake?: boolean;
} & {
  className?: string;
  style?: React.CSSProperties;
};

const StyledButtonBar = styled<JuiButtonBarProps, 'div'>('div')`
  display: flex;
  flex-direction: ${({ direction }) => direction === 'vertical' ? 'column' : 'row'};
`;

type StyledIconButtonChild = JuiIconButtonProps & JuiButtonBarProps & { index?: number, componentName: string };
type StyledCheckboxButtonChild = JuiCheckboxButtonProps & JuiButtonBarProps & { index?: number, componentName: string, variant?: string };
type StyledChild = StyledIconButtonChild | StyledCheckboxButtonChild;

const overlappingSize = {
  small: 1,
  medium: 2,
  large: 3,
};
const padding = (theme: Theme, componentName: string, size: string = 'medium', overlapping?: boolean, variant?: string) =>
  variant === 'plain' ? `${spacing(3)({ theme })}` :
    variant === 'round' || componentName === 'JuiCheckboxButton' ?
      (overlapping ? `-${spacing(overlappingSize[size])({ theme })}` : 0) : `${spacing(2)({ theme })}`;

const StyledChild = styledComponentWrapper<StyledChild>(
  ({ overlapping, componentName, ...rest }: StyledChild) => {
    if (componentName === 'JuiCheckboxButton') {
      return <JuiCheckboxButton {...(rest as JuiCheckboxButtonProps)} />;
    }
    return <JuiIconButton {...(rest as JuiIconButtonProps)} />;
  },
  css`
    margin-left: ${({ theme, direction = 'horizontal', index, componentName, size, overlapping, variant }) =>
      direction === 'horizontal' && index ? padding(theme, componentName, size, overlapping, variant) : ''};
    margin-top: ${({ theme, direction = 'horizontal', index, componentName, size, overlapping, variant }) =>
      direction === 'vertical' && index ? padding(theme, componentName, size, overlapping, variant) : ''};
  `,
);

type IButtonBar = React.SFC<JuiButtonBarProps> & IDependencies;
const JuiButtonBar: IButtonBar = ({ children, ...rest }) => {
  return (
    <StyledButtonBar {...rest} >
      {React.Children.toArray(children).map((child: React.ReactElement<any>, index: number) =>
        <StyledChild key={index} index={index} componentName={(child.type as React.SFC).name} {...child.props} {...rest} />)}
    </StyledButtonBar>
  );
};

JuiButtonBar.defaultProps = {
  overlapping: false,
  direction: 'horizontal',
};

JuiButtonBar.dependencies = [];

export { JuiButtonBar, JuiButtonBarProps };
export default JuiButtonBar;
