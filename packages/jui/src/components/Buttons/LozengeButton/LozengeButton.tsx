/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 10:36:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ButtonHTMLAttributes, memo } from 'react';
import styled from '../../../foundation/styled-components';
import { height, spacing, grey, typography } from '../../../foundation/utils';
import { RuiCircularProgress } from 'rcui/components/Progress';
import arrowUp from '../../../assets/jupiter-icon/icon-jump-to-unread.svg';
import arrowDown from '../../../assets/jupiter-icon/icon-jump-to-latest.svg';
import { JuiIconography } from '../../../foundation/Iconography';
import { DIRECTION } from '../../Lists';

type JuiLozengeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  arrowDirection?: DIRECTION;
};

const Arrow = styled(({ direction, ...rest }: { direction: DIRECTION }) => {
  const symbol = direction === DIRECTION.UP ? arrowUp : arrowDown;
  return <JuiIconography iconSize="extraSmall" symbol={symbol} {...rest} />;
})``;

const StyledLozengeButton = styled.button`
  ${typography('caption2')};
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

    ${RuiCircularProgress} {
      margin-left: ${spacing(1)};
    }
  }
  ${Arrow} {
    margin-left: ${spacing(2)};
  }
  &.lozengeButtonLoading,
  &.lozengeButtonWithArrow {
    ${Arrow}, ${RuiCircularProgress}, span {
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
        <RuiCircularProgress color="inherit" size={16} />
      ) : (
        arrowComponent
      )}
    </StyledLozengeButton>
  );
};

_JuiLozengeButton.defaultProps = {
  loading: false
};
_JuiLozengeButton.displayName = 'JuiLozengeButton';
const JuiLozengeButton = memo(_JuiLozengeButton);
export { JuiLozengeButton, JuiLozengeButtonProps, DIRECTION };
