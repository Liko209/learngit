/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 10:19:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import { RuiTooltip } from 'rcui/components/Tooltip';

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
import {
  IconPosition,
  InputRadius,
  InputRadiusKeys,
  OutlineTextSize,
} from './types';

const OUTLINE_TEXT_HEIGHT = {
  small: 8,
  medium: 10,
  large: 12,
};

const getRadius = (
  theme: Theme,
  radiusType: InputRadiusKeys,
  size: OutlineTextSize,
) => {
  const { radius, size: box } = theme;
  const type: InputRadius = {
    rectangle: radius.zero,
    rounded: radius.lg,
    circle: `${box.height * OUTLINE_TEXT_HEIGHT[size] * 0.5}px`,
  };
  return type[radiusType];
};

type CompositeWrapperProps = {
  iconPosition?: IconPosition;
  focus: boolean;
  radius: InputRadiusKeys;
  disabled?: boolean;
  size: OutlineTextSize;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const CompositeWrapper = ({
  iconPosition,
  radius,
  focus,
  disabled,
  size,
  ...rest
}: CompositeWrapperProps) => <div {...rest} />;

const StyledWrapper = styled<CompositeWrapperProps>(CompositeWrapper)`
  display: flex;
  align-items: center;
  position: relative;
  height: ${({ size }) => height(OUTLINE_TEXT_HEIGHT[size])};
  min-height: ${({ size }) => height(OUTLINE_TEXT_HEIGHT[size])};
  background-color: ${({ disabled }) =>
    disabled ? grey('100') : palette('common', 'white')};
  border: 1px solid ${({ focus }) => (focus ? grey('400') : grey('300'))};
  border-radius: ${({ theme, radius, size }) => getRadius(theme, radius, size)};
  box-sizing: border-box;
  padding: ${spacing(0, 4)};
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
    ${typography('subheading1')};
    color: ${grey('900')};
  }
`;

const StyledIcon = styled(JuiIconography)`
  color: ${grey('500')};
  width: ${width(5)};
  height: ${height(5)};
  align-items: center;
  cursor: pointer;
`;
const StyledIconLeft = styled(StyledIcon)`
  margin: 0 ${spacing(2)} 0 0;
`;
const StyledIconRight = styled(StyledIcon)`
  margin: 0 0 0 ${spacing(3)};
`;

type JuiOutlineTextFieldProps = {
  InputProps?: InputBaseProps;
  inputBefore?: JSX.Element | React.ReactNode;
  inputAfter?: JSX.Element | React.ReactNode;
  disabled?: boolean;
  radiusType?: InputRadiusKeys;
  IconLeftProps?: Partial<JuiIconographyProps> & {
    [arbitrary: string]: string;
  };
  IconRightProps?: Partial<JuiIconographyProps> & { [arbitrary: string]: any };
  onClickIconLeft?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onClickIconRight?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  value?: string;
  size?: OutlineTextSize;
  iconPosition?: IconPosition;
  iconName?: string | string[];
  className?: string;
  IconRightToolTip?: string;
};

type JuiOutlineTextFieldRef = {
  focus(): void;
  element: HTMLInputElement;
};

const JuiOutlineTextField = forwardRef(
  (props: JuiOutlineTextFieldProps, ref) => {
    const {
      iconPosition,
      iconName = '',
      InputProps = { onFocus: () => {}, onBlur: () => {} },
      radiusType = 'rounded',
      inputBefore,
      inputAfter,
      disabled,
      onChange,
      IconLeftProps,
      IconRightProps,
      IconRightToolTip,
      onClickIconLeft,
      onClickIconRight,
      onClick,
      value,
      size = 'medium',
      ...rest
    } = props;
    const { onFocus, onBlur, ...others } = InputProps;
    const [focus, setFocus] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      element: inputRef.current,
    }));

    const baseOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(true);
      onFocus && onFocus(e);
    };

    const baseOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(false);
      onBlur && onBlur(e);
    };

    // console.log(rest, others);
    const RightButton = () => {
      if (iconPosition === 'right' || iconPosition === 'both') {
        if (IconRightToolTip) {
          return (
            <RuiTooltip title={IconRightToolTip}>
              <StyledIconRight
                {...IconRightProps}
                iconSize="medium"
                onClick={onClickIconRight}
              >
                {Array.isArray(iconName) ? iconName[1] : iconName}
              </StyledIconRight>
            </RuiTooltip>
          );
        }
        return (
          <StyledIconRight
            {...IconRightProps}
            iconSize="medium"
            onClick={onClickIconRight}
          >
            {Array.isArray(iconName) ? iconName[1] : iconName}
          </StyledIconRight>
        );
      }
      return null;
    };

    return (
      <StyledWrapper
        focus={focus}
        radius={radiusType}
        disabled={disabled}
        onClick={onClick}
        size={size}
        {...rest}
      >
        {(iconPosition === 'left' || iconPosition === 'both') && (
          <StyledIconLeft
            {...IconLeftProps}
            iconSize="medium"
            onClick={onClickIconLeft}
          >
            {Array.isArray(iconName) ? iconName[0] : iconName}
          </StyledIconLeft>
        )}
        <StyledInput
          {...others}
          onFocus={baseOnFocus}
          onBlur={baseOnBlur}
          onChange={onChange}
          disabled={disabled}
          startAdornment={inputBefore || null}
          endAdornment={inputAfter || null}
          value={value}
          inputRef={inputRef}
        />
        {RightButton()}
      </StyledWrapper>
    );
  },
);

export {
  StyledIconRight,
  JuiOutlineTextField,
  JuiOutlineTextFieldProps,
  JuiOutlineTextFieldRef,
};
