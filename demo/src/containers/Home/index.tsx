/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-08 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import { VBox } from '@/components/Layout';
import LeftRail from '@/containers/LeftRail';
import Welcome from '@/containers/Welcome';
import Conversation from '@/components/Conversation';
import ContactList from '@/containers/ContactList';
import SplitPane from '@/components/SplitPane';
import Search from '@/containers/Search';
import NotificationBanner from '@/containers/NotificationBanner';

import HomeLoadingWrapper from './HomeLoadingWrapper';

const SplitPaneWrapper: any = styled(SplitPane)`
  &[max-width~='900px'] > .Pane1 {
    display: none;
  }
`;

const Right = styled.div`
  height: 100%;
  display: flex;
`;

export default class Home extends React.Component {
  render() {
    return (
      <VBox flex={1}>
        <HomeLoadingWrapper />
        <NotificationBanner />
        <SplitPaneWrapper defaultSize={270} minSize={120} maxSize={380}>
          <LeftRail />
          <Right>
            <Switch>
              <Route exact path="/" component={Welcome} />
              <Route path="/conversation/:id?" component={Conversation} />
              <Route path="/contact/list" component={ContactList} />
              <Route path="/search" component={Search} />
            </Switch>
          </Right>
        </SplitPaneWrapper>
      </VBox>
    );
  }
}
