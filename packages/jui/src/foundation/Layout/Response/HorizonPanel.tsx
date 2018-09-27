/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:29:15
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ReactNode, MouseEvent } from 'react';
import styled, { css } from 'styled-components';

type Position = 'left' | 'right';

type InternalPorps = {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  forceDisplay?: boolean;
  forcePosition?: Position;
  response?: boolean; // leftnav expend or collapes, there will be a flash
};

type ExternalPorps = InternalPorps & {
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
};

const Wrapper = styled.div`
  vertical-align: top;
  height: 100%;
  overflow: hidden;
  display: ${(props: InternalPorps) => props.width > 0 ? 'inline-block' : 'none'};
  background-color: ${({ theme }) => theme.palette.background.paper};
  z-index: ${({ theme }) => theme.zIndex.reponsePanel};
  ${props => props.response ? css`
    flex: 1;
  ` : css`
    flex-basis: ${(props: InternalPorps) => `${props.width}px`};
  `};
  ${props => props.forceDisplay && css`
    display: inline-block;
    position: absolute;
    top: 0;
    bottom: 0;
    width: ${({ theme }) => theme.size.width * 45}px;
    left: ${(props: InternalPorps) => props.forcePosition === 'left' ? 0 : 'auto'};
    right: ${(props: InternalPorps) => props.forcePosition === 'right' ? 0 : 'auto'};
    z-index: ${({ theme }) => theme.zIndex.reponseResizer};
  `}
`;

const JuiHorizonPanel = ({ width, minWidth, maxWidth, forceDisplay, forcePosition, onClick, children, response }: ExternalPorps) => {
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

export default JuiHorizonPanel;
