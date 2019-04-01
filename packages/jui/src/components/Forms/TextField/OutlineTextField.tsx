/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 10:19:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import styled from '../../../foundation/styled-components';
import {
  grey,
  palette,
  spacing,
  height,
  typography,
  width,
} from '../../../foundation/utils';
import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';
import { Theme } from '../../../foundation/theme/theme';

type IconPosition = 'left' | 'right' | 'both';

const INPUT_HEIGHT = 10;

type InputRadius = {
  square: string;
  round: string;
};
type InputRadiusKeys = keyof InputRadius;
const getRadius = (theme: Theme, radiusType: InputRadiusKeys) => {
  const { radius, size } = theme;
  const type: InputRadius = {
    square: radius.lg,
    round: `${size.height * INPUT_HEIGHT * radius.round}px`,
  };
  return type[radiusType];
};

type CompositeWrapperProps = {
  iconPosition?: IconPosition;
  focus: boolean;
  radius: InputRadiusKeys;
  disabled?: boolean;
};

const CompositeWrapper = ({
  iconPosition,
  radius,
  focus,
  disabled,
  ...rest
}: CompositeWrapperProps) => <div {...rest} />;

const StyledWrapper = styled<CompositeWrapperProps>(CompositeWrapper)`
  display: flex;
  align-items: center;
  position: relative;
  height: ${height(INPUT_HEIGHT)};
  background-color: ${({ disabled }) =>
    disabled ? grey('100') : palette('common', 'white')};
  border: 1px solid ${({ focus }) => (focus ? grey('400') : grey('300'))};
  border-radius: ${({ theme, radius }) => getRadius(theme, radius)};
  box-sizing: border-box;
  padding: 0 ${spacing(4)};
  &:hover {
    background-color: ${({ focus, disabled }) => {
      if (disabled) {
        return;
      }
      return focus ? palette('common', 'white') : grey('50');
    }};
  }
`;

const StyledInput = styled(InputBase)`
  && {
    flex: 1;
    ${typography('body1')};
    color: ${grey('900')};
  }
`;

const StyledIcon = styled(JuiIconography)`
  color: ${grey('500')};
  width: ${width(5)};
  height: ${height(5)};
  align-items: center;
  svg {
    font-size: ${spacing(5)};
  }
`;
const StyledIconLeft = styled(StyledIcon)`
  margin: 0 ${spacing(3)} 0 0;
`;
const StyledIconRight = styled(StyledIcon)`
  margin: 0 0 0 ${spacing(3)};
`;

type JuiOutlineTextFieldProps = {
  InputProps?: InputBaseProps;
  inputBefore?: JSX.Element;
  inputAfter?: JSX.Element;
  disabled?: boolean;
  radiusType?: InputRadiusKeys;
  IconLeftProps?: JuiIconographyProps;
  IconRightProps?: JuiIconographyProps;
  onClickIconLeft?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onClickIconRight?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
} & (
  | {
    iconPosition?: Extract<IconPosition, 'both'>;
    iconName?: string[];
  }
  | {
    iconPosition?: Exclude<IconPosition, 'both'>;
    iconName?: string;
  });

const JuiOutlineTextField = (props: JuiOutlineTextFieldProps) => {
  const {
    iconPosition,
    iconName = '',
    InputProps = { onFocus: () => {}, onBlur: () => {} },
    radiusType = 'square',
    inputBefore,
    inputAfter,
    disabled,
    onChange,
    IconLeftProps,
    IconRightProps,
    onClickIconLeft,
    onClickIconRight,
    ...rest
  } = props;
  const { onFocus, onBlur, ...others } = InputProps;
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
    <StyledWrapper
      focus={focus}
      radius={radiusType}
      disabled={disabled}
      {...rest}
    >
      {(iconPosition === 'left' || iconPosition === 'both') && (
        <StyledIconLeft {...IconLeftProps} onClick={onClickIconLeft}>
          {Array.isArray(iconName) ? iconName[0] : iconName}
        </StyledIconLeft>
      )}
      <StyledInput
        onFocus={baseOnFocus}
        onBlur={baseOnBlur}
        onChange={onChange}
        disabled={disabled}
        startAdornment={inputBefore || null}
        endAdornment={inputAfter || null}
        {...others}
      />
      {(iconPosition === 'right' || iconPosition === 'both') && (
        <StyledIconRight {...IconRightProps} onClick={onClickIconRight}>
          {Array.isArray(iconName) ? iconName[1] : iconName}
        </StyledIconRight>
      )}
    </StyledWrapper>
  );
};

export { JuiOutlineTextField, JuiOutlineTextFieldProps };
