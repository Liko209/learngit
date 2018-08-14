import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Wrapper from './Wrapper';
import LeftPanel from './Left';
import MainPanel from './Main';
import RightPanel from './Right';
// todo Left and Main and Right extends Panel component

interface IProps {
  path: any;
  left?: any;
  main: any;
  right?: any;
}

interface IStates { }

class LayoutRoute extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { left: Left, main: Main, right: Right, ...rest } = this.props;
    return (
      <Route {...rest}>
        {
          (props: any) =>
            <Wrapper>
              {Left && <LeftPanel><Left /></LeftPanel>}
              <MainPanel><Main /></MainPanel>
              {Right && <RightPanel><Right /></RightPanel>}
            </Wrapper>
        }
      </Route>
    );
  }
}

export default LayoutRoute;
