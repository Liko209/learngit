import React, { MouseEvent } from 'react';
import styled from 'styled-components';

interface IInternalProps {
  offset: number;
  show: boolean;
}

interface IExternalProps extends IInternalProps {
  onMouseDown: (e: MouseEvent) => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  z-index: ${({ theme }) => theme.zIndex.reponse};
  margin-left: ${({ theme }) => -theme.spacing.unit}px;
  padding: ${({ theme }) => theme.spacing.unit}px;
  cursor: col-resize;
  background-color: transparent;
  left: ${(props: IInternalProps) => `${props.offset}px`};
  display: ${(props: IInternalProps) => props.show ? 'block' : 'none'};
  /* &:hover {
    background-color: #999;
    transition: all 0.5s ease;
  } */
`;

const Resizer = ({ offset, show, onMouseDown }: IExternalProps) => {
  return <Wrapper onMouseDown={onMouseDown} offset={offset} show={show} />;
};

export default Resizer;
