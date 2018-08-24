import React, { ReactNode, MouseEvent } from 'react';
import styled, { css } from 'styled-components';

type TPosition = 'left' | 'right';

interface IInternalPorps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  forceDisplay?: boolean;
  forcePosition?: TPosition;
}

interface IExternalPorps extends IInternalPorps {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}

const Wrapper = styled.div`
  vertical-align: top;
  height: 100%;
  display: ${(props: IInternalPorps) => props.width > 0 ? 'inline-block' : 'none'};
  width: ${(props: IInternalPorps) => `${props.width}px`};
  /* transition: all .25s; */
  ${props => props.forceDisplay && css`
    display: inline-block;
    width: 180px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${(props: IInternalPorps) => props.forcePosition === 'left' ? 0 : 'auto'};
    right: ${(props: IInternalPorps) => props.forcePosition === 'right' ? 0 : 'auto'};
  `}
`;

const Panel = ({ width, minWidth, maxWidth, forceDisplay, forcePosition, onClick, children }: IExternalPorps) => {
  return (
    <Wrapper
      width={width}
      data-min-width={minWidth}
      data-max-width={maxWidth}
      forceDisplay={forceDisplay}
      forcePosition={forcePosition}
      onClick={onClick}
    >
      {children}
    </Wrapper>
  );
};

export default Panel;
