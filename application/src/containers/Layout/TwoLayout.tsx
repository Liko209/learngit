import React, { Component, ReactNode } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';

interface IProps {
  children: ReactNode[];
}

interface IStates { }

class TwoLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { children } = this.props;
    return (
      <Layout>
        <HorizonPanel width={400}>
          {children[0]}
        </HorizonPanel>
        <HorizonPanel width={400}>
          {children[1]}
        </HorizonPanel>
      </Layout>
    );
  }
}

export default TwoLayout;
