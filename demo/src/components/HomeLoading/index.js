/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-29 14:24:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

import LoadingIndicator from '../LoadingIndicator';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 20;
`;

const HomeLoading = () => (
  <Wrapper>
    <LoadingIndicator
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 'auto'
        }}
    />
  </Wrapper>
);

export default HomeLoading;
