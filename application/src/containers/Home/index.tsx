import React, { Component } from 'react';
import { RouteComponentProps, NavLink, Switch, Route, Redirect } from 'react-router-dom';

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
          <strong>top bar (always): </strong>
          <button onClick={this.onClick}>Logout</button>
        </div>
        <div>
          <strong>left nav (always): </strong>
          {/* <NavLink to="/" exact={true}>Home </NavLink> */}
          <NavLink to="/messages">Messages </NavLink>
          <NavLink to="/calls">Calls </NavLink>
          <NavLink to="/meetings">Meetings </NavLink>
        </div>
        <Switch>
          <Redirect exact={true} from="/" to="/messages" />
          <Route path="/messages" component={Conversations} />
          <Route path="/calls" component={Calls} />
          <Route path="/meetings" component={Meetings} />
          <Route component={NotFound} />
        </Switch>
      </div>);
  }
}

export default Home;
