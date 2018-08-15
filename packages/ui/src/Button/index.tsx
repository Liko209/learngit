import * as React from 'react';
import styled from 'styled-components';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';
import { WithTheme } from '@material-ui/core';

export type TButtonProps = {} & ButtonProps & Partial<Pick<WithTheme, 'theme'>>;

export const CustomButton: React.SFC<TButtonProps> = (props) => {
  return <MuiButton {...props} />;
};

export const Button = styled<TButtonProps>(CustomButton)`
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

export default Button;
