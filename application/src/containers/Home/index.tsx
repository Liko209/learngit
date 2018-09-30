import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
import { Messages } from '@/containers/Messages';
import { LeftNav } from '@/containers/LeftNav';
import Wrapper from './Wrapper';
import Bottom from './Bottom';

@observer
class Home extends Component<{}> {
  render() {
    return (
      <Wrapper>
        <TopBar />
        <Bottom>
          <LeftNav />
          <Route path="/messages/:id" component={Messages} />
        </Bottom>
      </Wrapper>
    );
  }
}

export default Home;
