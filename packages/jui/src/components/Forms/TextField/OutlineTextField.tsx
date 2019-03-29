/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:50:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import styled, { css } from '../../../foundation/styled-components';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import {
  grey,
  palette,
  spacing,
  height,
  typography,
  width,
} from '../../../foundation/utils';
import { JuiIconography } from '../../../foundation/Iconography';

type IconPosition = 'left' | 'right';

type RadiusType = 'square' | 'circle';

const INPUT_HEIGHT = 10;
const RADIUS_MAP = {
  square: 1,
  circle: INPUT_HEIGHT / 2,
};
const CLASSES_PAPER = { root: 'root' };

type CompositePaperProps = PaperProps & {
  iconPosition?: IconPosition;
  focus: boolean;
  radius: string;
  disabled?: boolean;
};

const CompositePaper = ({
  iconPosition,
  radius,
  focus,
  disabled,
  ...rest
}: CompositePaperProps) => <Paper {...rest} />;

const StyledPaper = styled<CompositePaperProps>(CompositePaper)`
  &.root {
    display: flex;
    align-items: center;
    position: relative;
    height: ${height(INPUT_HEIGHT)};
    background-color: ${({ disabled }) =>
      disabled ? grey('100') : palette('common', 'white')};
    border: 1px solid ${({ focus }) => (focus ? grey('400') : grey('300'))};
    border-radius: ${({ radius }) => spacing(RADIUS_MAP[radius])};
    /* ${({ disabled = false }) =>
      disabled ? 'pointer-events: none;' : ''}; */
    box-sizing: border-box;
    padding: 0 12px;
  }
  &:hover {
    background-color: ${({ focus, disabled }) => {
      if (disabled) {
        return;
      }
      return focus ? palette('common', 'white') : grey('50');
    }};
  }
`;

type CompositeInputProps = InputBaseProps & {
  iconPosition?: IconPosition;
};

const CompositeInput = ({ iconPosition, ...rest }: CompositeInputProps) => (
  <InputBase {...rest} />
);

const CLASSES_INPUT_BASE = {
  root: 'root',
};

const StyledInput = styled<CompositeInputProps>(CompositeInput)`
  &.root {
    flex: 1;
    ${typography('body1')};
    color: ${grey('900')};
    /* padding: ${spacing(1, 3)}; */
    /* ${({ iconPosition }: CompositeInputProps) => {
      if (iconPosition === 'left') {
        return css`
          padding-left: ${height(10)};
        `;
      }
      if (iconPosition === 'right') {
        return css`
          padding-right: ${height(10)};
        `;
      }
      return;
    }} */
  }
`;

const StyledIcon = styled(JuiIconography)`
  color: ${grey('500')};
  width: ${width(5)};
  height: ${height(5)};
  align-items: center;
`;
const StyledIconLeft = styled(StyledIcon)`
  margin: 0 ${spacing(3)} 0 0;
`;
const StyledIconRight = styled(StyledIcon)`
  margin: 0 0 0 ${spacing(3)};
`;

type Props = InputBaseProps & {
  inputBefore?: JSX.Element;
  inputAfter?: JSX.Element;
  iconPosition?: IconPosition;
  iconName?: string;
  maxLength?: number;
  radiusType?: RadiusType;
};

const JuiOutlineTextField = (props: Props) => {
  const {
    iconPosition,
    iconName = '',
    maxLength = 999999,
    radiusType = 'square',
    inputBefore,
    inputAfter,
    disabled,
    ...rest
  } = props;
  const inputProps = { maxLength };
  const { onFocus, onBlur, ...others } = rest;
  const [focus, setFocus] = useState(false);

  const baseOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(true);
    onFocus && onFocus(e);
  };

  const baseOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(false);
    onBlur && onBlur(e);
  };

  return (
    <StyledPaper
      focus={focus}
      radius={radiusType}
      elevation={0}
      classes={CLASSES_PAPER}
      disabled={disabled}
    >
      {iconPosition === 'left' && <StyledIconLeft>{iconName}</StyledIconLeft>}
      {inputBefore && inputBefore}
      <StyledInput
        classes={CLASSES_INPUT_BASE}
        iconPosition={iconPosition}
        inputProps={inputProps}
        onFocus={baseOnFocus}
        onBlur={baseOnBlur}
        disabled={disabled}
        {...others}
      />
      {inputAfter && inputAfter}
      {iconPosition === 'right' && (
        <StyledIconRight>{iconName}</StyledIconRight>
      )}
    </StyledPaper>
  );
};

export { JuiOutlineTextField };
