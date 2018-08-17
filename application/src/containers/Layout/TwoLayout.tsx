import React, { Component, ComponentClass, SFC, MouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';

interface IProps {
  Left: ComponentClass | SFC;
  Right: ComponentClass | SFC;
}

interface IStates {
  middle: number;
  left: number; // current left panel width value
  right: number;
  last_left: number; // last left panel width value
  last_right: number;
}

class TwoLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      middle: 0,
      left: 250, // current left panel width value
      right: 300,
      last_left: 250, // last left panel width value
      last_right: 300,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    // this.onMouseUp = this.onMouseUp.bind(this);
    // this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseDown(e: MouseEvent) {
    // document.addEventListener('mouseup', this.onMouseUp);
    // document.addEventListener('mousemove', this.onMouseMove);
    // if (!this.state.currentNode) {
    //   this.setState({ currentNode: e.target });
    // }
  }

  render() {
    const { Left, Right } = this.props;
    return (
      <Layout>
        <HorizonPanel width={400}>
          <Left />
        </HorizonPanel>
        {/* <HorizonResizer onMouseDown={this.onMouseDown} /> */}
        <HorizonPanel width={268}>
          <Right />
        </HorizonPanel>
      </Layout>
    );
  }
}

export default TwoLayout;
