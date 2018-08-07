import React, { Component } from 'react';
import { RouteComponentProps, Route } from 'react-router-dom';

import LeftRail from '@/containers/Conversations/LeftRail';
import Content from '@/containers/Conversations/Content';

interface IProps extends RouteComponentProps<any> { }

interface IStates { }

class Conversations extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { match } = this.props;
    return (
      <div>
        <LeftRail />
        <Route path={`${match.url}/:id?`} component={Content} />
      </div>);
  }
}

export default Conversations;
