import React, { Component, ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';
import HorizonButton from './HorizonButton';
import { addResizeListener, removeResizeListener } from './optimizedResize';
import { getOffsetLeft, pauseEvent } from './utils';

interface IProps {
  children: ReactNode[];
}

interface IStates {
  middle: number;
  left: number; // current panel width value
  right: number;
  localLeftPanelWidth: number; // remember last panel width value
  localRightPanelWidth: number;
  showLeftResizer: boolean; // show resizer
  showRightResizer: boolean;
  forceDisplayLeftPanel: boolean;
  forceDisplayRightPanel: boolean;
  currentElement: Element | null; // Resizer(vertical line)
  currentIndex: number;
}

class TreeLayout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    const localLeftPanelWidth = localStorage.getItem('conversation_left') || '268';
    const localRightPanelWidth = localStorage.getItem('conversation_right') || '268';
    this.state = {
      middle: 0,
      left: parseInt(localLeftPanelWidth, 10),
      right: parseInt(localRightPanelWidth, 10),
      localLeftPanelWidth: parseInt(localLeftPanelWidth, 10),
      localRightPanelWidth: parseInt(localRightPanelWidth, 10),
      showLeftResizer: true,
      showRightResizer: true,
      forceDisplayLeftPanel: false,
      forceDisplayRightPanel: false,
      currentElement: null,
      currentIndex: -1,
    };
    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClickLeftButton = this.onClickLeftButton.bind(this);
    this.onClickRightButton = this.onClickRightButton.bind(this);
    this.onClickLayout = this.onClickLayout.bind(this);
    this.onClickPreventBubble = this.onClickPreventBubble.bind(this);
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
          this.setState({ left: newLeftWidth, middle: newRightWidth, localLeftPanelWidth: newLeftWidth });
          localStorage.setItem('conversation_left', String(newLeftWidth));
          break;
        case 1:
          this.setState({ middle: newLeftWidth, right: newRightWidth, localRightPanelWidth: newRightWidth });
          localStorage.setItem('conversation_right', String(newRightWidth));
          break;
        default:
          break;
      }
    }
  }

  onResize() {
    let { left, middle, right, showLeftResizer, showRightResizer, forceDisplayLeftPanel, forceDisplayRightPanel } = this.state;
    const { localLeftPanelWidth, localRightPanelWidth } = this.state;
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
        // if (middle <= 400) {
        //   middle = 400;
        // }
      }
    } else {
      // show left
      if (left === 0 && middle >= 400 + 180) {
        left = 180;
        middle = body - nav - left - right;
      }
      if (left >= 180) {
        if (left < localLeftPanelWidth) {
          middle = 400;
          left = body - nav - middle - right;
        }
        // ensure left value too big, because setState is micro task
        if (left > localLeftPanelWidth) {
          left = localLeftPanelWidth;
          middle = body - nav - left - right;
        }
      }
      // show right
      if (right === 0 && middle >= 400 + 180) {
        right = 180;
        middle = body - nav - left - right;
      }
      if (right >= 180) {
        if (right < localRightPanelWidth) {
          middle = 400;
          right = body - nav - left - middle;
        }
        // ensure right value too big, because setState is micro task
        if (right > localRightPanelWidth) {
          right = localRightPanelWidth;
          middle = body - nav - left - right;
        }
      }
    }

    if (left === 0) {
      showLeftResizer = false;
    } else {
      showLeftResizer = true;
      forceDisplayLeftPanel = false;
    }

    if (right === 0) {
      showRightResizer = false;
      // forceDisplayRightPanel = true;
    } else {
      showRightResizer = true;
      forceDisplayRightPanel = false;
    }

    this.setState({ left, middle, right, showLeftResizer, showRightResizer, forceDisplayLeftPanel, forceDisplayRightPanel });
  }

  onClickLeftButton(e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { forceDisplayLeftPanel } = this.state;
    this.setState({ forceDisplayLeftPanel: !forceDisplayLeftPanel, forceDisplayRightPanel: false });
  }

  onClickRightButton(e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { forceDisplayRightPanel } = this.state;
    this.setState({ forceDisplayLeftPanel: false, forceDisplayRightPanel: !forceDisplayRightPanel });
  }

  onClickPreventBubble(e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  onClickLayout() {
    this.setState({
      forceDisplayLeftPanel: false,
      forceDisplayRightPanel: false,
    });
  }

  render() {
    const { children } = this.props;
    const { left, middle, right, showLeftResizer, showRightResizer, forceDisplayLeftPanel, forceDisplayRightPanel } = this.state;
    return (
      <Layout onClick={this.onClickLayout}>
        <HorizonPanel width={left} minWidth={180} maxWidth={360} forceDisplay={forceDisplayLeftPanel} forcePosition="left" onClick={this.onClickPreventBubble}>
          {children[0]}
        </HorizonPanel>
        <HorizonResizer offset={left} onMouseDown={this.onMouseDown} show={showLeftResizer} />
        <HorizonPanel width={middle} minWidth={400}>
          {children[1]}
        </HorizonPanel>
        <HorizonResizer offset={left + middle} onMouseDown={this.onMouseDown} show={showRightResizer} />
        <HorizonPanel width={right} minWidth={180} maxWidth={360} forceDisplay={forceDisplayRightPanel} forcePosition="right" onClick={this.onClickPreventBubble}>
          {children[2]}
        </HorizonPanel>
        <HorizonButton offset={left + (forceDisplayLeftPanel ? 180 : 0)} onClick={this.onClickLeftButton} show={!showLeftResizer} />
        <HorizonButton offset={left + middle - 10 - (forceDisplayRightPanel ? 180 : 0)} onClick={this.onClickRightButton} show={!showRightResizer} />
      </Layout>
    );
  }
}

export default TreeLayout;
