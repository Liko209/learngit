import React, { MouseEvent } from 'react';
import styled, { css } from 'styled-components';

interface IWrapperPorps {
  offset: number;
  show: boolean;
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
  ${props => !props.show && css`
    display: none;
  `}
`;

const Resizer = ({ offset, show, onMouseDown }: IResizerPorps) => {
  return <Wrapper onMouseDown={onMouseDown} offset={offset} show={show} />;
};

export default Resizer;
