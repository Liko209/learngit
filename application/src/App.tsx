/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { hot } from 'react-hot-loader';
import { DataView, DataViewVM } from './dataview';

type DemoViewProps = {
  id: number;
  text: string;
};

function sleep(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    },         time);
  });
}

class DemoVM extends DataViewVM<DemoViewProps> {
  async dataLoader(): Promise<DemoViewProps> {
    await sleep(3000);
    return {
      id: 1,
      text: 'Hello World',
    };
  }
}

const DemoView = (props: DemoViewProps) => (
  <div>
    {props.id} - {props.text}
  </div>
);

class DemoContainer extends React.Component {
  state = {
    vm: new DemoVM(),
  };

  public render() {
    this.state.vm.data;
    return <DataView vm={this.state.vm} View={DemoView} />;
  }
}

class App extends React.PureComponent {
  public render() {
    return <DemoContainer />;
  }
}

export default hot(module)(App);
