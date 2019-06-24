import React, { memo } from 'react';
import { ButtonBaseProps as MuiButtonBaseProps } from '@material-ui/core/ButtonBase';
import styled from '../../foundation/styled-components';
import { JuiIconography, SvgSymbol } from '../../foundation/Iconography';
import { StyledIconButton, StyledTextButton } from './style';

type JuiSnackbarActionProps = MuiButtonBaseProps & {
  variant?: 'text' | 'icon';
  children?: string;
  icon?: SvgSymbol;
};

const JuiSnackbarAction = styled(
  memo(({ children, variant, icon, ...rest }: JuiSnackbarActionProps) => {
    if (variant === 'icon') {
      return (
        <StyledIconButton {...rest}>
          <JuiIconography iconSize="large" symbol={icon}>
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
