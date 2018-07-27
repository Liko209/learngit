/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-11 14:19:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

import Button from '../Button';

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 2px;
  width: 400px;
`;

const Download = () => (
  <Wrapper>
    Download:{' '}
    <Button
        inline
        backgroundColor="#007bff"
        borderHoverColor="#0069d9"
        href="https://download.fiji.gliprc.com/Fiji.exe"
    >
      Windows
    </Button>
    <Button
        inline
        backgroundColor="#007bff"
        borderHoverColor="#0069d9"
        href="https://download.fiji.gliprc.com/Fiji.dmg"
    >
      Mac
    </Button>
  </Wrapper>
);

export default Download;
