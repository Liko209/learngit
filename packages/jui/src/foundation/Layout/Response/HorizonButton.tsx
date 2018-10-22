/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import styled from '../../styled-components';

type InternalProps = {
  offset: number;
  show: boolean;
};

type ExternalProps = InternalProps & {
  onClick: (e: MouseEvent) => void;
};

// todo: have not UX design
const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  width: 10px;
  height: 20px;
  cursor: pointer;
  background-color: red;
  z-index: ${({ theme }) => theme.zIndex.reponseResizer};
  left: ${(props: InternalProps) => `${props.offset}px`};
  display: ${(props: InternalProps) => (props.show ? 'block' : 'none')};
`;

const JuiHorizonButton = ({ offset, show, onClick }: ExternalProps) => {
  return <Wrapper onClick={onClick} offset={offset} show={show} />;
};

export default JuiHorizonButton;
