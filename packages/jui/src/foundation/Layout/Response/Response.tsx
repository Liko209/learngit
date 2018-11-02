/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:42:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent, ReactNode } from 'react';
import styled from '../../styled-components';

type ExternalProps = {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode[];
  // ref?: React.RefObject<HTMLDivElement>;
};

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  height: 100%; // safari compatibility
`;

const JuiResponse = ({ onClick, children }: ExternalProps) => {
  return <Wrapper onClick={onClick}>{children}</Wrapper>;
};

export default JuiResponse;
