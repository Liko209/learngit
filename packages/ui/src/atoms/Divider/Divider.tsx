/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from 'styled-components';
import MuiDivider, { DividerProps as MuiDividerProps } from '@material-ui/core/Divider';

type JuiDividerProps = MuiDividerProps & {};

const StyledDivider = styled(MuiDivider)`
  && {
    background-color: ${({ theme }) => theme.palette.grey['300']};
  }
`;

const JuiDivider = ({ innerRef, ...rest }: JuiDividerProps) => <StyledDivider {...rest} />;

export { JuiDividerProps, JuiDivider };
export default JuiDivider;
