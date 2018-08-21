import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

interface IWrapperPorps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

interface IPanelProps extends IWrapperPorps {
  children: ReactNode;
}

const Wrapper = styled.div`
  display: inline-block;
  height: 100%;
  vertical-align: top;
  ${(props: IWrapperPorps) => props.width ? css`
    width: ${(props: IWrapperPorps) => `${props.width}px`};
  ` : css`
    display: none;
  `}
`;

const Panel = ({ width, minWidth, maxWidth, children }: IPanelProps) => {
  return (
    <Wrapper width={width} data-min-width={minWidth} data-max-width={maxWidth}>
      {children}
    </Wrapper>
  );
};

export default Panel;
