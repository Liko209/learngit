import React, { Component, ComponentClass, SFC, MouseEvent as ReactMouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';
import { addResizeListener, removeResizeListener } from './optimizedResize';
import { getOffsetLeft, getOffsetTop, pauseEvent } from './utils';

interface IProps {
  Left: ComponentClass | SFC;
  Middle: ComponentClass | SFC;
  Right: ComponentClass | SFC;
}

interface IStates {
  middle: number;
  left: number; // current left panel width value
  right: number;
  last_left: number; // last left panel width value
  last_right: number;
  currentNode: any;
}

class TreeLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      middle: 0,
      left: 250, // current left panel width value
      right: 300,
      last_left: 250, // last left panel width value
      last_right: 300,
      currentNode: null,
    };
    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  componentDidMount() {
    addResizeListener(this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    removeResizeListener();
  }

  onMouseDown(e: ReactMouseEvent) {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener<'mousemove'>('mousemove', this.onMouseMove);
    if (!this.state.currentNode) {
      this.setState({ currentNode: e.target });
    }
  }

  onMouseUp() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener<'mousemove'>('mousemove', this.onMouseMove);
    if (this.state.currentNode) {
      this.setState({ currentNode: null });
    }
  }

  onMouseMove(e: MouseEvent) {
    pauseEvent(e); // mouse move prevent select text
    const { currentNode } = this.state;
    if (currentNode === null) {
      return; // document mousemove
    }
    const leftNode: any = currentNode.previousSibling;
    let leftWidth = 0;
    let leftMinWidth = 0;
    let leftMaxWidth = 0;
    if (leftNode) {
      leftWidth = leftNode.getAttribute('width');
      leftMinWidth = leftNode.getAttribute('minWidth');
      leftMaxWidth = leftNode.getAttribute('maxWidth');
    }
    const rightNode: any = currentNode.nextSibling;
    let rightWidth = 0;
    let rightMinWidth = 0;
    let rightMaxWidth = 0;
    if (rightNode) {
      rightWidth = rightNode.getAttribute('width');
      rightMinWidth = rightNode.getAttribute('minWidth');
      rightMaxWidth = rightNode.getAttribute('maxWidth');
    }

    const leftNodeOffsetLeft = getOffsetLeft(leftNode);
    const rightNodeOffsetLeft = getOffsetLeft(rightNode);
    const rightNodeOffsetWidth = rightNode.offsetWidth;
    const clientX = e.clientX;

    const newLeftWidth = clientX - leftNodeOffsetLeft;
    const newRightWidth = rightNodeOffsetWidth - (clientX - rightNodeOffsetLeft);

    this.setState({ middle: newLeftWidth, right: newRightWidth });

    // leftNode.setAttribute('width', newLeftWidth);
    // rightNode.setAttribute('width', newRightWidth);

  }

  onResize() {
    let { left, middle, right } = this.state;
    const { last_left, last_right } = this.state;
    const nav = 72; // todo 72 is dynamic value
    const max = 1820; // todo change to 1920
    const windowWidth = window.innerWidth;
    const body = windowWidth > max ? max : windowWidth;

    middle = body - nav - left - right;
    if (middle <= 400) {
      // hide right
      middle = 400;
      right = body - nav - left - middle;
      if (right < 180) {
        right = 0;
        middle = body - nav - left - right;
      }
      if (middle <= 400) {
        // hide left
        middle = 400;
        left = body - nav - middle - right;
        if (left < 180) {
          left = 0;
          middle = body - nav - left - right;
        }
        if (middle <= 400) {
          middle = 400;
        }
      }
    } else {
      // show left
      if (left === 0 && middle >= 400 + 180) {
        left = 180;
        middle = body - nav - left - right;
      }
      if (left >= 180) {
        if (left < last_left) {
          middle = 400;
          left = body - nav - middle - right;
        } else {
          left = last_left;
          middle = body - nav - left - right;
        }
      }
      // show right
      if (right === 0 && middle >= 400 + 180) {
        right = 180;
        middle = body - nav - left - right;
      }
      if (right >= 180) {
        if (right < last_right) {
          middle = 400;
          right = body - nav - left - middle;
        } else {
          right = last_right;
          middle = body - nav - left - right;
        }
      }
    }

    this.setState({ left, middle, right });
  }

  render() {
    const { Left, Middle, Right } = this.props;
    const { left, middle, right } = this.state;
    return (
      <Layout>
        <HorizonPanel width={left} minWidth={180} maxWidth={360}>
          <Left />
        </HorizonPanel>
        <HorizonResizer offset={left} onMouseDown={this.onMouseDown} />
        <HorizonPanel width={middle}>
          <Middle />
        </HorizonPanel>
        <HorizonResizer offset={left + middle} onMouseDown={this.onMouseDown} />
        <HorizonPanel width={right} minWidth={180} maxWidth={360}>
          <Right />
        </HorizonPanel>
      </Layout>
    );
  }
}

export default TreeLayout;
