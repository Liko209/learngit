import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
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
        </Bottom>
      </Wrapper>
    );
  }
}

export default Home;
