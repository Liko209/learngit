import React, { ButtonHTMLAttributes } from 'react';
import Styled from '../../../foundation/styled-components';
import { typography, spacing } from '../../../foundation/shared/theme';
import { RuiCircularProgress } from '../../Progress';

type Direction = 'down' | 'up';
type RuiLozengeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  arrowDirection?: Direction;
};

const Arrow = Styled('span')<{ direction?: Direction }>`
   border: ${spacing('xxxs')} solid transparent;
  ${({ direction }) =>
    direction === 'down'
      ? 'border-top-color: white; top: 2px;'
      : 'border-bottom-color: white; top: -2px;'};
  position: relative;
  margin: ${spacing('xxxs')} ${spacing('xxxs')} ${spacing('xxxs')} ${spacing(
  'xxs',
)};
  display: inline-block;
  vertical-align: middle;
`;

const StyledLozengeButton = Styled.button`
  ${typography('body1')};
  padding: ${spacing('xxs')} ${spacing('m')};
  height: 32px;
  line-height: 0;
  border-radius: 32px;
  border: none;
  background-color: ${({ theme }) => theme.palette.grey[700]};
  color: ${({ theme }) => theme.palette.common.white};
  box-shadow: ${({ theme }) => theme.shadows[7]};
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${({ theme }) => theme.palette.grey[900]}
  };
  &.lozengeButtonLoading {
    pointer-events: none;
    ${RuiCircularProgress} {
      margin-left: ${({ theme }) => theme.spacing['xxxs']};
    }
  };
  &.lozengeButtonLoading,
  &.lozengeButtonWithArrow {
    ${Arrow}, ${RuiCircularProgress}, span {
      vertical-align: middle;
    }
  }
`;

const RuiLozengeButton = (props: RuiLozengeButtonProps) => {
  const { loading, arrowDirection, className, children } = props;
  let newClassName = className;
  newClassName += loading ? ' lozengeButtonLoading' : '';
  newClassName += arrowDirection ? ' lozengeButtonWithArrow' : '';

  return (
    <StyledLozengeButton className={newClassName}>
      <span> {children} </span>
      {loading ? (
        <RuiCircularProgress color="inherit" size={16} />
      ) : (
        <Arrow direction={arrowDirection} />
      )}
    </StyledLozengeButton>
  );
};

RuiLozengeButton.defaultProps = {
  loading: false,
  arrowDirection: 'down',
};

export { RuiLozengeButton, RuiLozengeButtonProps };
