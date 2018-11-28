import React from 'react';
import MuiButtonBase, {
  ButtonBaseProps as MuiButtonBaseProps,
} from '@material-ui/core/ButtonBase';
import styled from '../../foundation/styled-components';
import {
  activeOpacity,
  disabledOpacity,
  typography,
  height,
} from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';

type JuiSnackbarActionProps = MuiButtonBaseProps & {
  variant?: 'text' | 'icon';
};

const StyledTextButton = styled(MuiButtonBase)`
  ${typography('body2')}
  line-height: ${height(4)};

  &:hover {
    text-decoration: underline;
  }

  &:active {
    ${activeOpacity()}
  }

  &:disabled {
    ${disabledOpacity()}
  }
`;

const StyledIconButton = styled(MuiButtonBase)`
  font-size: ${height(6)};

  &:active {
    ${activeOpacity()}
  }

  &:disabled {
    ${disabledOpacity()}
  }
`;

const JuiSnackbarAction = styled(
  ({ children, variant, ...rest }: JuiSnackbarActionProps) => {
    if (variant === 'icon') {
      return (
        <StyledIconButton {...rest}>
          <JuiIconography fontSize="inherit">{children}</JuiIconography>
        </StyledIconButton>
      );
    }

    return <StyledTextButton {...rest}>{children}</StyledTextButton>;
  },
)``;

JuiSnackbarAction.displayName = 'JuiSnackbarAction';
JuiSnackbarAction.defaultProps = {
  color: 'white',
  disableRipple: true,
  variant: 'text',
};

export { JuiSnackbarAction, JuiSnackbarActionProps };
