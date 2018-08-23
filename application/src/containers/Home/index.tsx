import React, { Component } from 'react';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';

import Wrapper from './Wrapper';
import TopBar from './TopBar';
import Bottom from './Bottom';
import LeftNav from './LeftNav';
import Main from './Main';

import NotFound from '@/containers/NotFound';
import Conversations from '@/containers/Conversations';
import Calls from '@/containers/Calls';
import Meetings from '@/containers/Meetings';

import { service } from 'sdk';

const { AuthService } = service;

interface IProps { }

interface IStates { }

class Home extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.signOutClickHandler = this.signOutClickHandler.bind(this);
  }

  async signOutClickHandler() {
    const authService: service.AuthService = AuthService.getInstance();
    await authService.logout();
    window.location.href = '/';
  }

  render() {
    return (
      <Wrapper>
        <TopBar>
          <button onClick={this.signOutClickHandler}>Logout</button>
        </TopBar>
        <Bottom>
          <LeftNav>
            {/* <NavLink to="/" exact={true}>Home </NavLink> */}
            <NavLink to="/messages">Messages </NavLink>
            <NavLink to="/calls">Calls </NavLink>
            <NavLink to="/meetings">Meetings </NavLink>
          </LeftNav>
          <Main>
            <Switch>
              <Redirect exact={true} from="/" to="/messages" />
              <Route path="/messages/:id?" component={Conversations} />
              <Route path="/calls" component={Calls} />
              <Route path="/meetings" component={Meetings} />
              <Route component={NotFound} />
            </Switch>
          </Main>

        </Bottom>

      </Wrapper>);
  }
}

export default Home;
