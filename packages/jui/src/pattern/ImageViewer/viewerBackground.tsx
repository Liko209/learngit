/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-06 14:56:42
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled, { keyframes } from '../../foundation/styled-components';
import { grey, height } from '../../foundation/utils';
import { JuiTransition } from '../../components/Animation';

type JuiViewerBackgroundProps = {
  children: React.ReactNode;
  show: boolean;
};

const backgroundAnimation = keyframes`
  from {
    background: transparent;
  }
  to {
  }
`;

const StyledViewerBackground = styled.div`
  background: ${grey('100')};
  display: flex;
  flex-direction: column;
  height: inherit;
  min-height: ${height(160)};
  > div {
    overflow: scroll;
  }
`;

const StyledTransition = styled(JuiTransition)`
  height: 100%;
`;

const JuiViewerBackground = ({ children, show }: JuiViewerBackgroundProps) => {
  return (
    <StyledTransition
      show={show}
      duration="standard"
      easing="sharp"
      appear={true}
      animation={backgroundAnimation}
    >
      <StyledViewerBackground>{children}</StyledViewerBackground>
    </StyledTransition>
  );
};

export { JuiViewerBackground, JuiViewerBackgroundProps };
