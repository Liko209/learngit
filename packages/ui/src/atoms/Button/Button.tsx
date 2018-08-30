/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../styled-components';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';

const StyledButton = styled<ButtonProps>(MuiButton)`
  && {
    min-width: ${({ theme }) => theme.spacing.unit * 26}px;
  }
`;

type IButton = { dependencies?: React.ComponentType[] } & React.SFC<ButtonProps>;

const Button: IButton = ({ innerRef, ...rest }) => {
  return <StyledButton {...rest} />;
};

Button.defaultProps = {
  size: 'large',
};

Button.dependencies = [MuiButton];

export { Button, ButtonProps };
export default Button;
