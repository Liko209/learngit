/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 17:10:17
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, width } from '../../foundation/utils';
import { JuiSnackbar } from '../../components/Snackbars';

type JuiToastWrapperProps = {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
};

const Outer = styled<JuiToastWrapperProps, 'div'>('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  padding: ${spacing(0, 6)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.toast};
`;

const Inner = styled<JuiToastWrapperProps, 'div'>('div')`
  display: inline-block;
  width: 100%;
  max-width: ${width(160)};
  ${JuiSnackbar} + ${JuiSnackbar} {
    margin-top: ${spacing(3)};
  }
`;

const JuiToastWrapper = (props: JuiToastWrapperProps) => (
  <Outer>
    <Inner {...props} />
  </Outer>
);

export { JuiToastWrapper, JuiToastWrapperProps };
export default JuiToastWrapper;
