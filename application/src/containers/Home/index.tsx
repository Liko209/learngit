import React, { Component } from 'react';
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
import { Messages } from '@/containers/Messages';
import { LeftNav } from '@/containers/LeftNav';
import NotFound from '@/containers/NotFound';
import Wrapper from './Wrapper';
import Bottom from './Bottom';

@observer
class HomeComponent extends Component<RouteComponentProps> {
  render() {
    return (
      <Wrapper>
        <TopBar />
        <Bottom>
          <LeftNav />
          <Switch>
            <Redirect exact={true} from="/" to="/messages" />
            <Route path="/messages/:id?" component={Messages} />
            <Route component={NotFound} />
          </Switch>
        </Bottom>
      </Wrapper>
    );
  }
}

const Home = withRouter(HomeComponent);

export default Home;
