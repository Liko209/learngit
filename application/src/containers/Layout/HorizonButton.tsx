import React, { MouseEvent } from 'react';
import styled from 'styled-components';

interface IInternalPorps {
  offset: number;
  show: boolean;
}

interface IExternalPorps extends IInternalPorps {
  onClick: (e: MouseEvent) => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: auto;
  z-index: 8888;
  background-color: red;
  width: 20px;
  height: 20px;
  cursor: pointer;
  left: ${(props: IInternalPorps) => `${props.offset}px`};
  display: ${(props: IInternalPorps) => props.show ? 'block' : 'none'};
`;

const Button = ({ offset, show, onClick }: IExternalPorps) => {
  return <Wrapper onClick={onClick} offset={offset} show={show} />;
};

export default Button;
