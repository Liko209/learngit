import React, { Component, ComponentClass, SFC, MouseEvent as ReactMouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';
// import HorizonButton from './HorizonButton';
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
  show_left_resizer: boolean; // show resizer
  show_right_resizer: boolean;
  show_left_button: boolean;
  show_right_button: boolean;
  currentElement: Element | null; // Resizer(vertical line)
  currentIndex: number;
}

class TreeLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    const last_left = localStorage.getItem('conversation_left') || '268';
    const last_right = localStorage.getItem('conversation_right') || '268';
    this.state = {
      middle: 0,
      left: parseInt(last_left, 10),
      right: parseInt(last_right, 10),
      last_left: parseInt(last_left, 10),
      last_right: parseInt(last_right, 10),
      show_left_resizer: true,
      show_right_resizer: true,
      show_left_button: false,
      show_right_button: false,
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
    // window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    removeResizeListener();
    // window.removeEventListener('resize', this.onResize);
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
          localStorage.setItem('conversation_left', String(newLeftWidth));
          break;
        case 1:
          this.setState({ middle: newLeftWidth, right: newRightWidth, last_right: newRightWidth });
          localStorage.setItem('conversation_right', String(newRightWidth));
          break;
        default:
          break;
      }
    }
  }

  onResize() {
    let { left, middle, right, show_left_resizer, show_right_resizer } = this.state;
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
        }
        // ensure left value too big, because setState is micro task
        if (left > last_left) {
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
        }
        // ensure right value too big, because setState is micro task
        if (right > last_right) {
          right = last_right;
          middle = body - nav - left - right;
        }
      }
    }

    if (left === 0) {
      show_left_resizer = false;
    } else {
      show_left_resizer = true;
    }

    if (right === 0) {
      show_right_resizer = false;
    } else {
      show_right_resizer = true;
    }

    this.setState({ left, middle, right, show_left_resizer, show_right_resizer });
  }

  onClick() {

  }

  render() {
    const { Left, Middle, Right } = this.props;
    const { left, middle, right, show_left_resizer, show_right_resizer } = this.state;
    return (
      <Layout>
        <HorizonPanel width={left} minWidth={180} maxWidth={360}>
          <Left />
        </HorizonPanel>
        <HorizonResizer offset={left} onMouseDown={this.onMouseDown} show={show_left_resizer} />
        <HorizonPanel width={middle} minWidth={400}>
          <Middle />
        </HorizonPanel>
        <HorizonResizer offset={left + middle} onMouseDown={this.onMouseDown} show={show_right_resizer} />
        {/* <HorizonButton offset={left + middle - 10} onClick={this.onClick} show={!show_right_resizer} /> */}
        <HorizonPanel width={right} minWidth={180} maxWidth={360}>
          <Right />
        </HorizonPanel>
      </Layout>
    );
  }
}

export default TreeLayout;
