import React, { memo } from 'react';
import { ButtonBaseProps as MuiButtonBaseProps } from '@material-ui/core/ButtonBase';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import { StyledIconButton, StyledTextButton } from './style';

// Close icon size is smaller than font-size,
// Let's use transform to make it looks right.
const CLOSE_ICON_SIZE_FIX = { transform: 'scale(1.7142857142857142)' };

type JuiSnackbarActionProps = MuiButtonBaseProps & {
  variant?: 'text' | 'icon';
  children: string;
};

const JuiSnackbarAction = styled(
  memo(({ children, variant, ...rest }: JuiSnackbarActionProps) => {
    if (variant === 'icon') {
      const style = children === 'close' ? CLOSE_ICON_SIZE_FIX : undefined;

      return (
        <StyledIconButton {...rest}>
          <JuiIconography iconSize="inherit" style={style}>
            {children}
          </JuiIconography>
        </StyledIconButton>
      );
    }

    return <StyledTextButton {...rest}>{children}</StyledTextButton>;
  }),
)``;

JuiSnackbarAction.displayName = 'JuiSnackbarAction';
JuiSnackbarAction.defaultProps = {
  color: 'white',
  disableRipple: true,
  variant: 'text',
};

export { JuiSnackbarAction, JuiSnackbarActionProps };
