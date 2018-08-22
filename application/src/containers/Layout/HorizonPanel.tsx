import React, { ReactNode, MouseEvent } from 'react';
import styled, { css } from 'styled-components';

type TPosition = 'left' | 'right';

interface IWrapperPorps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  forceDisplay?: boolean;
  forcePosition?: TPosition;
}

interface IPanelProps extends IWrapperPorps {
  onClick?: (event: MouseEvent) => void;
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
  ${props => props.forceDisplay && css`
    display: inline-block;
    width: 180px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${(props: IWrapperPorps) => props.forcePosition === 'left' ? 0 : 'auto'};
    right: ${(props: IWrapperPorps) => props.forcePosition === 'right' ? 0 : 'auto'};
  `}
`;

const Panel = ({ width, minWidth, maxWidth, forceDisplay, forcePosition, onClick, children }: IPanelProps) => {
  return (
    <Wrapper width={width} data-min-width={minWidth} data-max-width={maxWidth} forceDisplay={forceDisplay} forcePosition={forcePosition} onClick={onClick}>
      {children}
    </Wrapper>
  );
};

export default Panel;
