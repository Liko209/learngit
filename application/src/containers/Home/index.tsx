import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
import Wrapper from './Wrapper';

@observer
class Home extends Component<{}> {
  render() {
    return (
      <Wrapper>
        <TopBar />
      </Wrapper>
    );
  }
}

export default Home;
