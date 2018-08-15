import React from 'react';
import styled from 'styled-components';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';
import { WithTheme } from '@material-ui/core';

type TButtonProps = {} & ButtonProps & Partial<Pick<WithTheme, 'theme'>>;

const StyledButton = styled<TButtonProps>(MuiButton)`
  && {
    min-width: 104px;
    min-height: ${props =>
    props.size && props.size === 'small' ? '28px' : '40px'};
    height: ${props =>
    props.size && props.size === 'small' ? '28px' : '40px'};
    padding: ${props => (props.href ? '0' : '0 20px')};
    font-size: 14px;
    line-height: 16px;
    border-radius: 2px;
  }
`;

export const Button: React.SFC<TButtonProps> = ({ innerRef, ...rest }) => {
  return <StyledButton {...rest} />;
};

export { TButtonProps };
export default Button;
