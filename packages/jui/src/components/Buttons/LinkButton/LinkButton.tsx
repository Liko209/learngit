/*
 * @Author: ken.li
 * @Date: 2019-03-14 18:30:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, width, palette } from '../../../foundation/utils/styles';
import { JuiButtonColor, ColorMap } from '../Button';

type JuiLinkButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'large';
  disabled?: boolean;
  color?: JuiButtonColor;
};

const StyledLinkButton = styled.button`
  ${typography('button')};
  color: ${({ color = 'primary' }) =>
    palette(ColorMap[color][0], ColorMap[color][1])};
  min-width: ${width(16)};
  border: none;
  background-color: ${({ theme, color = 'primary' }) =>
    theme.palette.getContrastText(
      palette(ColorMap[color][0], ColorMap[color][1])({ theme }),
    )};
  outline: none;

  &:hover {
    cursor: pointer;
    color: ${({ color = 'primary' }) => palette(ColorMap[color][0], 'light')};
  }
  &.disabled {
    color: ${palette('accent', 'ash')};
  }
`;

const JuiLinkButtonComponent: React.StatelessComponent<JuiLinkButtonProps> = (
  props: JuiLinkButtonProps,
) => {
  return (
    <StyledLinkButton className={props.disabled ? 'disabled' : ''} {...props}>
      <span>{props.children}</span>
    </StyledLinkButton>
  );
};

JuiLinkButtonComponent.defaultProps = {
  color: 'primary',
  size: 'small',
  disabled: false,
};

const JuiLinkButton = React.memo(JuiLinkButtonComponent);

export { JuiLinkButton, JuiLinkButtonProps };
