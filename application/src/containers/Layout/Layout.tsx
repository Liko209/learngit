import React, { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

interface IExternalPorps {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode[];
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const Layout = ({ onClick, children }: IExternalPorps) => {
  return (
    <Wrapper onClick={onClick}>
      {children}
    </Wrapper>
  );
};

export default Layout;
