import * as React from 'react';
import styled from '../../styled-components';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';

type TButtonProps = {} & ButtonProps;

const StyledButton = styled<TButtonProps>(MuiButton)`
  && {
    min-width: ${({ theme }) => theme.spacing.unit * 26}px;
  }
`;

export const Button: React.SFC<TButtonProps> = ({ innerRef, ...rest }) => {
  return <StyledButton {...rest} />;
};

Button.defaultProps = {
  size: 'large',
};

export { TButtonProps };
export default Button;
