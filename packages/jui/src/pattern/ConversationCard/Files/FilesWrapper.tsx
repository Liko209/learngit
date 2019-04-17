/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-16 10:17:30
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

type JuiFileWrapperProps = {
  children?: React.ReactNode;
};

const Wrapper = styled.div`
  margin-top: ${spacing(1)};
`;

const JuiFileWrapper = React.memo((props: JuiFileWrapperProps) => {
  const { children } = props;
  return <Wrapper>{children}</Wrapper>;
});

export { JuiFileWrapper, JuiFileWrapperProps };
