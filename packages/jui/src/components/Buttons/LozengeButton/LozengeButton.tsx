/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 10:36:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ButtonHTMLAttributes } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  grey,
  typography,
  width,
} from '../../../foundation/utils';
import { JuiCircularProgress } from '../../Progress/CircularProgress';
import { JuiFade } from '../../Fade';

type Direction = 'up' | 'down';
type JuiLozengeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  arrowDirection?: Direction;
};

const Arrow = styled<{ direction: Direction }, 'span'>('span')`
  border: ${width(1)} solid transparent;
  ${({ direction }) =>
    direction === 'down'
      ? 'border-top-color: white; top: 2px;'
      : 'border-bottom-color: white; top: -2px;'};
  position: relative;
  margin: ${spacing(1, 1, 1, 2)};
  display: inline-block;
  vertical-align: middle;
`;

const StyledLozengeButton = styled.button`
  ${typography('body1')};
  padding: ${spacing(2, 5)};
  height: ${height(8)};
  line-height: 0;
  border-radius: ${height(8)};
  border: none;
  background-color: ${grey('700')};
  color: white;
  box-shadow: ${props => props.theme.shadows[7]};
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${grey('900')};
  }

  &.lozengeButtonLoading {
    pointer-events: none;

    ${JuiCircularProgress} {
      margin-left: ${spacing(1)};
    }
  }

  &.lozengeButtonLoading,
  &.lozengeButtonWithArrow {
    ${Arrow}, ${JuiCircularProgress}, span {
      vertical-align: middle;
    }
  }
`;

const JuiLozengeButton: React.StatelessComponent<JuiLozengeButtonProps> = ({
  children,
  loading,
  arrowDirection,
  ...rest
}: JuiLozengeButtonProps) => {
  let className = loading ? 'lozengeButtonLoading' : '';
  className += arrowDirection ? ' lozengeButtonWithArrow' : '';

  const arrowComponent = arrowDirection ? (
    <Arrow direction={arrowDirection} />
  ) : null;

  return (
    <StyledLozengeButton {...rest} className={className}>
      <span>{children}</span>
      {loading ? (
        <JuiFade in={true} style={{ transitionDelay: '500ms' }}>
          <JuiCircularProgress color="inherit" size={16} />
        </JuiFade>
      ) : (
        arrowComponent
      )}
    </StyledLozengeButton>
  );
};

JuiLozengeButton.defaultProps = {
  loading: false,
};
JuiLozengeButton.displayName = 'JuiLozengeButton';

export { JuiLozengeButton };
