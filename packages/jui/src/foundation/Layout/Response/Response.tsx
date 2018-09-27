/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:42:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

type ExternalPorps = {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode[];
  // ref?: React.RefObject<HTMLDivElement>;
};

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  bottom:0;
  right: 0;
  left: 0;
  overflow: hidden;
  display: flex;
`;

const JuiResponse = ({ onClick, children }: ExternalPorps) => {
  return (
    <Wrapper onClick={onClick}>
      {children}
    </Wrapper>
  );
};

export default JuiResponse;
