/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { analytics } from '@/Analytics';
import { DialogPortal } from '@/containers/Dialog';
import { ToastWrapper } from '@/containers/ToastWrapper';

import { HomeRouter } from '../HomeRouter';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import Wrapper from './Wrapper';

@observer
class HomeView extends Component<HomeViewProps> {
  componentDidMount() {
    analytics.identify();
  }

  render() {
    return (
      <Wrapper>
        <TopBar />
        <Bottom>
          <ToastWrapper />
          <LeftNav />
          <HomeRouter />
          <DialogPortal />
        </Bottom>
      </Wrapper>
    );
  }
}

export { HomeView };
