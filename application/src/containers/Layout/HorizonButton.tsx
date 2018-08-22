import React from 'react';
import styled, { css } from 'styled-components';

interface IWrapperPorps {
  offset: number;
  show: boolean;
}

interface IButtonPorps extends IWrapperPorps {
  onClick: () => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${(props: IWrapperPorps) => `${props.offset}px`};
  right: auto;
  z-index: 9999;
  background-color: red;
  width: 10px;
  height: 20px;
  cursor: pointer;
  ${props => props.show === false && css`
    display: none;
  `}
`;

const Button = ({ offset, show, onClick }: IButtonPorps) => {
  return <Wrapper onClick={onClick} offset={offset} show={show} />;
};

export default Button;
