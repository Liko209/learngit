import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { LeftNav } from 'ui-components';
import Main from './Main';

import NotFound from '@/containers/NotFound';
import Conversations from '@/containers/Conversations';
import Calls from '@/containers/Calls';
import Meetings from '@/containers/Meetings';

import TopBar from 'ui-components/organisms/TopBar';
import avatar from './avatar.jpg';

import { service } from 'sdk';

const { AuthService } = service;

interface IProps extends RouteComponentProps<any> { }

interface IStates {
  isExpand: boolean;
}
class Home extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isExpand: localStorage.getItem('isExpand') === null ? true :
        JSON.parse(String(localStorage.getItem('isExpand'))),
    };
    this.signOutClickHandler = this.signOutClickHandler.bind(this);
  }

  async signOutClickHandler() {
    const authService: service.AuthService = AuthService.getInstance();
    await authService.logout();
    window.location.href = '/';
  }
  handleExpand = () => {
    this.setState({
      isExpand: !this.state.isExpand,
    });
    localStorage.setItem('isExpand', JSON.stringify(!this.state.isExpand));
  }
  render() {
    // const { match } = this.props;
    const { isExpand } = this.state;
    return (
      <Wrapper>
        <TopBar handleLeftNavExpand={this.handleExpand} avatar={avatar} presence="online"/>
        <Bottom>
          <LeftNav isExpand={isExpand} id="leftnav"/>
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
