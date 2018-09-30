import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
import { Messages } from '@/containers/Messages';
import Wrapper from './Wrapper';

@observer
class Home extends Component<{}> {
  render() {
    return (
      <Wrapper>
        <TopBar />
        <Messages />
      </Wrapper>
    );
  }
}

export default Home;
