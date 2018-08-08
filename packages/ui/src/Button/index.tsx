import React from 'react';
import styled, { withTheme } from 'styled-components';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';
import { WithTheme } from '@material-ui/core';

export type TButtonProps = {} & ButtonProps & Partial<Pick<WithTheme, 'theme'>>;

export const CustomButton: React.SFC<TButtonProps> = (props) => {
  return <MuiButton {...props} />;
};

export const Button = styled<TButtonProps>(withTheme(CustomButton)).attrs({})`
  min-width: 104px !important;
  min-height: ${props =>
    props.size && props.size === 'small' ? '28px' : '40px'} !important;
  height: ${props =>
    props.size && props.size === 'small' ? '28px' : '40px'} !important;
  padding: ${props => (props.href ? '0' : '0 20px')} !important;
  font-size: 14px !important;
  line-height: 16px !important;
  border-radius: 2px !important;
`;

export default Button;
