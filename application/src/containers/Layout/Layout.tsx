import React, { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

interface IExternalPorps {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode[];
  // ref?: React.RefObject<HTMLDivElement>;
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  bottom:0;
  right: 0;
  left: 0;
`;

const Layout = ({ onClick, children }: IExternalPorps) => {
  return (
    <Wrapper onClick={onClick}>
      {children}
    </Wrapper>
  );
};

export default Layout;
