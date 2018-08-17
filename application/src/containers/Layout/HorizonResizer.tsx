import React, { MouseEvent } from 'react';
import styled from 'styled-components';

interface IWrapperPorps {
  offset: number;
}

interface IResizerPorps extends IWrapperPorps {
  onMouseDown: (e: MouseEvent) => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${(props: IWrapperPorps) => `${props.offset}px`};
  right: auto;
  z-index: 9999;
  background-color: #999;
  margin-left: -3px;
  padding: 3px
  cursor: col-resize;
`;

const Resizer = ({ offset, onMouseDown }: IResizerPorps) => {
  return <Wrapper onMouseDown={onMouseDown} offset={offset} />;
};

export default Resizer;
