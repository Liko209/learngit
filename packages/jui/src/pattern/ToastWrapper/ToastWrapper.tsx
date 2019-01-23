/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 17:10:17
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';
import { JuiSnackbar } from '../../components/Snackbars';

type JuiToastWrapperProps = {
  className?: string;
  paddingTop?: number;
  children?: React.ReactNode[] | React.ReactNode;
};

const JuiToastWrapper = styled<JuiToastWrapperProps, 'div'>('div')`
  position: fixed;
  top: ${({ paddingTop }) => spacing(paddingTop ? paddingTop / 4 : 16)};
  padding-left: ${spacing(6)};
  padding-right: ${spacing(6)};
  left: 0;
  right: 0;
  box-sizing: border-box;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.toast};
  ${JuiSnackbar} + ${JuiSnackbar} {
     margin-top: ${spacing(3)};
   }
`;

export { JuiToastWrapper, JuiToastWrapperProps };
export default JuiToastWrapper;
