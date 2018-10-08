import React, { MouseEvent } from 'react';
import styled from '../../styled-components';

interface IInternalProps {
  offset: number;
  show: boolean;
}

interface IExternalProps extends IInternalProps {
  onClick: (e: MouseEvent) => void;
}

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
  left: ${(props: IInternalProps) => `${props.offset}px`};
  display: ${(props: IInternalProps) => (props.show ? 'block' : 'none')};
`;

const Button = ({ offset, show, onClick }: IExternalProps) => {
  return <Wrapper onClick={onClick} offset={offset} show={show} />;
};

export default Button;
