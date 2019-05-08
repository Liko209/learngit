/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-06 14:56:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import styled, { css } from '../../foundation/styled-components';
import { grey } from '../../foundation/utils';

type JuiViewerBackgroundProps = {
  children: React.ReactNode;
  show: boolean;
};

const transition = css`
  transition: ${({ theme }) => theme.transitions.duration['standard']}ms
    ${({ theme }) => theme.transitions.easing['sharp']};
  transition-delay: 15ms;
`;

const StyledViewerBackground = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  height: inherit;
  background: transparent;
  ${transition};
  ${({ show }) =>
    show
      ? css`
          background: ${grey('100')};
        `
      : css`
          background: transparent;
        `}
`;

const JuiViewerBackground = ({
  children,
  show,
  ...rest
}: JuiViewerBackgroundProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  },        [show]);
  return (
    <StyledViewerBackground {...rest} show={show && mounted}>
      {children}
    </StyledViewerBackground>
  );
};

export { JuiViewerBackground, JuiViewerBackgroundProps };
