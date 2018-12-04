/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-20 16:05:12
 * Copyright © RingCentral. All rights reserved.
 */

import styled, { css } from '../../styled-components';

type Props = {
  width: number;
  forceShow: boolean;
  forcePosition: 'left' | 'right';
  forceWidth: number;
};

const StyledSidebarPanel = styled('div')`
  height: 100%;
  flex-basis: ${(props: Props) => `${props.width}px`};
  display: ${(props: Props) => (props.width > 0 ? 'block' : 'none')};
  background-color: ${({ theme }) => theme.palette.background.paper};
  overflow: hidden;
  ${(props: Props) =>
    props.forceShow &&
    css`
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      width: ${props.forceWidth}px;
      z-index: ${({ theme }: any) => theme.zIndex.modal};
      left: ${props.forcePosition === 'left' ? 0 : 'auto'};
      right: ${props.forcePosition === 'right' ? 0 : 'auto'};
    `};
`;

export { StyledSidebarPanel };
