import React, { Component, ComponentClass, SFC, MouseEvent as ReactMouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';
import { addResizeListener, removeResizeListener } from './optimizedResize';
import { getOffsetLeft, pauseEvent } from './utils';

interface IProps {
  Left: ComponentClass | SFC;
  Middle: ComponentClass | SFC;
  Right: ComponentClass | SFC;
}

interface IStates {
  middle: number;
  left: number; // current panel width value
  right: number;
  last_left: number; // remember last panel width value
  last_right: number;
  show_left: boolean; // show resizer
  show_right: boolean;
  currentElement: Element | null; // Resizer(vertical line)
  currentIndex: number;
}

class TreeLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      middle: 0,
      left: 250,
      right: 300,
      last_left: 250,
      last_right: 300,
      show_left: true,
      show_right: true,
      currentElement: null,
      currentIndex: -1,
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
    document.addEventListener<'mousemove'>('mousemove', this.onMouseMove); // document mousemove
    const currentElement = e.nativeEvent.srcElement;
    const parentElement = currentElement!.parentElement;
    const collectionElement = parentElement!.querySelectorAll('[offset]');
    const currentIndex = Array.from(collectionElement).indexOf(currentElement!);
    this.setState({ currentElement, currentIndex });
  }

  onMouseUp() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener<'mousemove'>('mousemove', this.onMouseMove);
    if (this.state.currentElement) {
      this.setState({ currentElement: null, currentIndex: -1 });
    }
  }

  onMouseMove(e: MouseEvent) {
    pauseEvent(e); // mouse move prevent select text
    const { currentElement, currentIndex } = this.state;

    const leftNode: any = currentElement!.previousSibling;
    const leftMinWidth = leftNode.dataset.minWidth || 10;
    const leftMaxWidth = leftNode.dataset.maxWidth || 9999;
    const rightNode: any = currentElement!.nextSibling;
    const rightMinWidth = rightNode.dataset.minWidth || 10;
    const rightMaxWidth = rightNode.dataset.maxWidth || 9999;

    const clientX = e.clientX;
    const leftNodeOffsetLeft = getOffsetLeft(leftNode);
    const rightNodeOffsetLeft = getOffsetLeft(rightNode);
    const rightNodeOffsetWidth = rightNode.offsetWidth;

    const newLeftWidth = clientX - leftNodeOffsetLeft;
    const newRightWidth = rightNodeOffsetWidth - (clientX - rightNodeOffsetLeft);

    if (newLeftWidth >= leftMinWidth
      && newLeftWidth <= leftMaxWidth
      && newRightWidth >= rightMinWidth
      && newRightWidth <= rightMaxWidth) {
      switch (currentIndex) {
        case 0:
          this.setState({ left: newLeftWidth, middle: newRightWidth, last_left: newLeftWidth });
          break;
        case 1:
          this.setState({ middle: newLeftWidth, right: newRightWidth, last_right: newRightWidth });
          break;
        default:
          break;
      }
    }
  }

  onResize() {
    let { left, middle, right, show_left, show_right } = this.state;
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

    if (left === 0) {
      show_left = false;
    } else {
      show_left = true;
    }

    if (right === 0) {
      show_right = false;
    } else {
      show_right = true;
    }

    this.setState({ left, middle, right, show_left, show_right });
  }

  render() {
    const { Left, Middle, Right } = this.props;
    const { left, middle, right, show_left, show_right } = this.state;
    return (
      <Layout>
        <HorizonPanel width={left} minWidth={180} maxWidth={360}>
          <Left />
        </HorizonPanel>
        <HorizonResizer offset={left} onMouseDown={this.onMouseDown} show={show_left} />
        <HorizonPanel width={middle} minWidth={400}>
          <Middle />
        </HorizonPanel>
        <HorizonResizer offset={left + middle} onMouseDown={this.onMouseDown} show={show_right} />
        <HorizonPanel width={right} minWidth={180} maxWidth={360}>
          <Right />
        </HorizonPanel>
      </Layout>
    );
  }
}

export default TreeLayout;
