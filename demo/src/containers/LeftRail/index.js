/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-12 15:25:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from 'styled-components';

import { styledTheme } from '#/styled';

import Header from './Header';
import SearchBar from './SearchBar';
import Main from './Main';

const LeftRailWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px 10px 5px;
  display: flex;
  flex-direction: column;
  background: ${styledTheme.colorPrimary};
`;

const LeftRail = () => (
  <LeftRailWrapper>
    <Header />
    <SearchBar />
    <Main />
  </LeftRailWrapper>
);

export default LeftRail;
