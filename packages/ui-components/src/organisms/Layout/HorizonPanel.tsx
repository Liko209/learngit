import React, { ReactNode, MouseEvent } from 'react';
import styled, { css } from 'styled-components';

type TPosition = 'left' | 'right';

interface IInternalProps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  forceDisplay?: boolean;
  forcePosition?: TPosition;
  response?: boolean; // leftnav expend or collapes, there will be a flash
}

interface IExternalProps extends IInternalProps {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}

const Wrapper = styled.div`
  vertical-align: top;
  height: 100%;
  display: ${(props: IInternalProps) => props.width > 0 ? 'inline-block' : 'none'};
  overflow: hidden;
  background-color: ${({ theme }) => theme.palette.background.paper};
  z-index: 1;
  /* width: ${(props: IInternalProps) => `${props.width}px`}; */
  /* transition: all .25s; */
  ${props => props.response ? css`
    flex: 1;
  ` : css`
    flex-basis: ${(props: IInternalProps) => `${props.width}px`};
  `};
  ${props => props.forceDisplay && css`
    display: inline-block;
    width: ${({ theme }) => theme.size.width * 45}px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${(props: IInternalProps) => props.forcePosition === 'left' ? 0 : 'auto'};
    right: ${(props: IInternalProps) => props.forcePosition === 'right' ? 0 : 'auto'};
    z-index: 2;
  `}
`;

const Panel = ({ width, minWidth, maxWidth, forceDisplay, forcePosition, onClick, children, response }: IExternalProps) => {
  return (
    <Wrapper
      width={width}
      data-min-width={minWidth}
      data-max-width={maxWidth}
      forceDisplay={forceDisplay}
      forcePosition={forcePosition}
      onClick={onClick}
      response={response}
    >
      {children}
    </Wrapper>
  );
};

export default Panel;
