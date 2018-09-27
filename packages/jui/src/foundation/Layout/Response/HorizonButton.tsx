/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import styled from '../../styled-components';

type InternalPorps = {
  offset: number;
  show: boolean;
};

type ExternalPorps = InternalPorps & {
  onClick: (e: MouseEvent) => void;
};

// todo: have not UX design
const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  z-index: ${({ theme }) => theme.zIndex.reponseResizer};
  background-color: red;
  width: 10px;
  height: 20px;
  cursor: pointer;
  left: ${(props: InternalPorps) => `${props.offset}px`};
  display: ${(props: InternalPorps) => (props.show ? 'block' : 'none')};
`;

const JuiHorizonButton = ({ offset, show, onClick }: ExternalPorps) => {
  return <Wrapper onClick={onClick} offset={offset} show={show} />;
};

export default JuiHorizonButton;
