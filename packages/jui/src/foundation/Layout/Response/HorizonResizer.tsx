/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:20:52
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import styled from 'styled-components';

type InternalPorps = {
  offset: number;
  show: boolean;
};

type ExternalPorps = InternalPorps & {
  onMouseDown: (e: MouseEvent) => void;
};

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  cursor: col-resize;
  background-color: transparent;
  z-index: ${({ theme }) => theme.zIndex.reponseResizer};
  margin-left: ${({ theme }) => -theme.spacing.unit}px;
  padding: ${({ theme }) => theme.spacing.unit}px;
  left: ${({ offset }: InternalPorps) => `${offset}px`};
  display: ${({ show }: InternalPorps) => show ? 'block' : 'none'};
`;

const JuiHorizonResizer = ({ offset, show, onMouseDown }: ExternalPorps) => {
  return <Wrapper onMouseDown={onMouseDown} offset={offset} show={show} />;
};

export default JuiHorizonResizer;
