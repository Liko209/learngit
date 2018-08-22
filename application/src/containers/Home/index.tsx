import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';

import Wrapper from './Wrapper';
import TopBar from './TopBar';
import Bottom from './Bottom';
import { LeftNav } from 'ui-components';
import Main from './Main';

import NotFound from '@/containers/NotFound';
import LayoutRoute from '@/containers/LayoutRoute';

import ConversationLeft from '@/containers/Conversations/LeftRail';
import ConversationMain from '@/containers/Conversations/Thread';
import ConversationRight from '@/containers/Conversations/RightRail';
import CallMain from '@/containers/Calls/Main';
import CallRight from '@/containers/Calls/Right';
import MeetingMain from '@/containers/Meetings/Main';
import MeetingRight from '@/containers/Meetings/Right';

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
        <TopBar>
          <button onClick={this.signOutClickHandler}>Logout</button>
          <button onClick={this.handleExpand}>Expand</button>
        </TopBar>
        <Bottom>
          <LeftNav isExpand={isExpand}/>
          <Main>
            <Switch>
              <Redirect exact={true} from="/" to="/messages" />
              {/* <Route path="/messages/:id?" component={Conversation} /> */}
              <LayoutRoute
                path="/messages/:id?"
                Left={ConversationLeft}
                Middle={ConversationMain}
                Right={ConversationRight}
              />
              <LayoutRoute path="/calls" Left={CallMain} Right={CallRight} />
              <LayoutRoute path="/meetings" Left={MeetingMain} Right={MeetingRight} />
              <Route component={NotFound} />
            </Switch>
          </Main>

        </Bottom>

      </Wrapper>);
  }
}

export default Home;
