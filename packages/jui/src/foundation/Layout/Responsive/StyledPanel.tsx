/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-20 16:05:12
 * Copyright © RingCentral. All rights reserved.
 */

import styled, { css } from '../../styled-components';

type Props = {
  position: 'left' | 'right';
};

type StyledContentProps = {
  width: number;
};

const StyledPanel = styled('div')`
  height: 100%;
  background-color: ${({ theme }) => theme.palette.background.paper};
  overflow: hidden;
  display: flex;
  ${(props: Props) =>
    css`
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: ${({ theme }: any) => theme.zIndex.modal};
      left: ${props.position === 'left' ? 0 : 'auto'};
      right: ${props.position === 'right' ? 0 : 'auto'};
    `};
`;

const StyledContent = styled('div')`
  height: 100%;
  ${(props: StyledContentProps) =>
    css`
      width: ${props.width === 0 ? 0 : `${props.width}px`};
    `};
`;

export { StyledPanel, StyledContent };
