import React, { Component } from 'react';
import { RouteComponentProps, NavLink, Switch, Route, Redirect } from 'react-router-dom';

import AuthRoute from '@/containers/AuthRoute';
import Conversations from '@/containers/Conversations';
import Calls from '@/containers/Calls';
import Meetings from '@/containers/Meetings';
import NotFound from '@/containers/NotFound';

interface IProps extends RouteComponentProps<any> { }

interface IStates { }

class Home extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { history } = this.props;
    localStorage.removeItem('login'); // todo
    history.replace('/login');
  }

  render() {
    // const { match } = this.props;
    return (
      <div>
        <div>
          top bar (always):
          <button onClick={this.onClick}>Logout</button>
        </div>
        <div>
          left nav (always):
          <NavLink to="/">Home </NavLink>
          <NavLink to="/messages">Messages </NavLink>
          <NavLink to="/calls">Calls </NavLink>
          <NavLink to="/meetings">Meetings </NavLink>
        </div>
        <Switch>
          <Redirect exact={true} from="/" to="/messages" />
          <AuthRoute path="/messages" component={Conversations} />
          <AuthRoute path="/calls" component={Calls} />
          <AuthRoute path="/meetings" component={Meetings} />
          <Route component={NotFound} />
        </Switch>
      </div>);
  }
}

export default Home;
