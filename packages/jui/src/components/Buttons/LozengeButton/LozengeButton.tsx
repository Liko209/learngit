/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 10:36:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ButtonHTMLAttributes, memo } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  grey,
  typography,
  width,
} from '../../../foundation/utils';
import { JuiCircularProgress } from '../../Progress/CircularProgress';

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

const _JuiLozengeButton: React.StatelessComponent<JuiLozengeButtonProps> = ({
  children,
  loading,
  arrowDirection,
  className = '',
  ...rest
}: JuiLozengeButtonProps) => {
  let newClassName = className;
  newClassName += loading ? ' lozengeButtonLoading' : '';
  newClassName += arrowDirection ? ' lozengeButtonWithArrow' : '';

  const arrowComponent = arrowDirection ? (
    <Arrow direction={arrowDirection} />
  ) : null;

  return (
    <StyledLozengeButton {...rest} className={newClassName}>
      <span>{children}</span>
      {loading ? (
        <JuiCircularProgress color="inherit" size={16} />
      ) : (
        arrowComponent
      )}
    </StyledLozengeButton>
  );
};

_JuiLozengeButton.defaultProps = {
  loading: false,
};
_JuiLozengeButton.displayName = 'JuiLozengeButton';
const JuiLozengeButton = memo(_JuiLozengeButton);
export { JuiLozengeButton };
