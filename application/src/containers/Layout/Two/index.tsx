import React, { Component } from 'react';

import Wrapper from '@/containers/Layout/Two/Wrapper';
import Left from '@/containers/Layout/Two/Left';
import Right from '@/containers/Layout/Two/Right';

interface IProps {
  path: any;
  left: any;
  right: any;
}

interface IStates { }

class TwoLayout extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { left: LeftPanel, right: RightPanel } = this.props;
    return (
      <Wrapper>
        <Left>
          <LeftPanel />
        </Left>
        <Right>
          <RightPanel />
        </Right>
      </Wrapper>);
  }
}

export default TwoLayout;
