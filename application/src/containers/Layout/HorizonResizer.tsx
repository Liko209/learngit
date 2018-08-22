import React, { MouseEvent } from 'react';
import styled from 'styled-components';

interface IInternalPorps {
  offset: number;
  show: boolean;
}

interface IExternalPorps extends IInternalPorps {
  onMouseDown: (e: MouseEvent) => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  z-index: 9999;
  margin-left: -3px;
  padding: 3px;
  cursor: col-resize;
  background-color: transparent;
  left: ${(props: IInternalPorps) => `${props.offset}px`};
  display: ${(props: IInternalPorps) => props.show ? 'block' : 'none'};
  &:hover {
    background-color: #999;
    transition: all 0.5s ease;
  }
`;

const Resizer = ({ offset, show, onMouseDown }: IExternalPorps) => {
  return <Wrapper onMouseDown={onMouseDown} offset={offset} show={show} />;
};

export default Resizer;
