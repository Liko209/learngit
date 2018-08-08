import React, { Component } from 'react';
// import { RouteComponentProps } from 'react-router-dom';

import Wrapper from '@/containers/Layout/Three/Wrapper';
import Left from '@/containers/Layout/Three/Left';
import Middle from '@/containers/Layout/Three/Middle';
import Right from '@/containers/Layout/Three/Right';

interface IProps {
  path: any;
  left: any;
  middle: any;
  right: any;
}

interface IStates { }

class ThreeLayout extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { left: LeftPanel, middle: MiddlePanel, right: RightPanel } = this.props;
    return (
      <Wrapper>
        <Left>
          <LeftPanel />
        </Left>
        <Middle>
          <MiddlePanel />
        </Middle>
        <Right>
          <RightPanel />
        </Right>
      </Wrapper>);
  }
}

export default ThreeLayout;
