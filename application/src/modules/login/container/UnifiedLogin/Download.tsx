/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-23 14:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 10px;
  width: 400px;
`;

const DownLoadLink = styled.a`
  padding: 7px 15px;
  border-radius: 5px;
  background: #007bff;
  display: inline-block;
  color: #fff;
  text-decoration: none;
  margin: 0 10px;
  cursor: pointer;
`;

const Download = () => (
  <Wrapper>
    Download:{' '}
    <DownLoadLink download={true} href="/downloads/RingCentral.exe">
      Windows
    </DownLoadLink>
    <DownLoadLink download={true} href="/downloads/RingCentral.dmg">
      Mac
    </DownLoadLink>
  </Wrapper>
);

export default Download;
