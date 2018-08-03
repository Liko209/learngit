import React, { Component } from 'react';
import { RouteComponentProps, NavLink, Switch, Route } from 'react-router-dom';

import AuthRoute from '@/containers/AuthRoute';
import Messages from '@/containers/Messages';
import Calls from '@/containers/Calls';
import Meetings from '@/containers/Meetings';
import NotFound from '@/containers/NotFound';

// const Oneself = () => {
//   return <h3>Please select a left nav.</h3>;
// };

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
    const { match } = this.props;
    return (
      <div>
        <h2>
          left nav
          <NavLink to="/">Home</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/calls">Calls</NavLink>
          <NavLink to="/meetings">Meetings</NavLink>
          <button onClick={this.onClick}>Logout</button></h2>
        <Switch>
          <AuthRoute
            exact={true}
            path={match.url}
            component={Messages}
          />
          <AuthRoute
            path={`${match.url}messages/:id?`}
            component={Messages}
          />
          <AuthRoute
            path={`${match.url}calls`}
            component={Calls}
          />
          <AuthRoute
            path={`${match.url}meetings`}
            component={Meetings}
          />
          <Route component={NotFound} />
        </Switch>
      </div>);
  }
}

export default Home;
