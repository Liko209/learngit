import React, { Component, ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import Layout from './Layout';
import HorizonPanel from './HorizonPanel';
import HorizonResizer from './HorizonResizer';
import HorizonButton from './HorizonButton';
import { addResizeListener, removeResizeListener } from './optimizer';
import { getOffsetLeft, pauseEvent } from './utils';

interface IProps {
  tag: string;
  children: ReactNode[];
}

interface IStates {
  middle: number;
  left: number; // current panel width value
  right: number;
  localLeftPanelWidth: number;
  localRightPanelWidth: number;
  showLeftResizer: boolean;
  showRightResizer: boolean;
  forceDisplayLeftPanel: boolean;
  forceDisplayRightPanel: boolean;
  currentElement: Element | null; // Resizer(vertical line)
  currentIndex: number;
}

class TreeLayout extends Component<IProps, IStates> {
  // private refLayout: React.RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);
    const { tag } = props;
    // this.refLayout = React.createRef();
    const localLeftPanelWidth = localStorage.getItem(`${tag}_left`) || '268';
    const localRightPanelWidth = localStorage.getItem(`${tag}_right`) || '268';
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
    this.onResize();
  }

  componentWillUnmount() {
    removeResizeListener();
  }

  onMouseDown(e: ReactMouseEvent) {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener<'mousemove'>('mousemove', this.onMouseMove); // document mousemove
    const currentElement = e.nativeEvent.srcElement; // Resizer
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
    const { tag } = this.props;

    const leftNode: any = currentElement!.previousSibling;
    // safari bug
    // leftNode.dataset.minWidth || 10;
    // https://stackoverflow.com/questions/45769532/safari-is-everywhere-bug-html5-dataset-attribute-can-not-be-obtained
    const leftMinWidth = leftNode.getAttribute('data-min-width') || 10;
    const leftMaxWidth = leftNode.getAttribute('data-max-width') || 9999;
    const rightNode: any = currentElement!.nextSibling;
    const rightMinWidth = rightNode.getAttribute('data-min-width') || 10;
    const rightMaxWidth = rightNode.getAttribute('data-max-width') || 9999;
    // console.log(leftMinWidth, leftMaxWidth);
    // console.log(rightMinWidth, rightMaxWidth);

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
          localStorage.setItem(`${tag}_left`, String(newLeftWidth));
          break;
        case 1:
          this.setState({ middle: newLeftWidth, right: newRightWidth, localRightPanelWidth: newRightWidth });
          localStorage.setItem(`${tag}_right`, String(newRightWidth));
          break;
        default:
          break;
      }
    }
  }

  onResize() {
    let { left, middle, right, showLeftResizer, showRightResizer, forceDisplayLeftPanel, forceDisplayRightPanel } = this.state;
    const { localLeftPanelWidth, localRightPanelWidth } = this.state;
    const nav = document.getElementById('leftnav')!.getBoundingClientRect().width;
    const max = 1920;
    const windowWidth = window.innerWidth;
    const body = windowWidth > max ? max : windowWidth;
    // const element = ReactDOM.findDOMNode(this.refLayout.current!) as Element;
    // const layoutWidth = element.parentElement!.getBoundingClientRect().width;
    // console.log(layoutWidth);
    // const nav = body - layoutWidth;

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
    } else {
      showRightResizer = true;
      forceDisplayRightPanel = false;
    }

    this.setState({
      left,
      middle,
      right,
      showLeftResizer,
      showRightResizer,
      forceDisplayLeftPanel,
      forceDisplayRightPanel,
    });
  }

  onClickLeftButton(e: ReactMouseEvent) {
    pauseEvent(e);
    const { forceDisplayLeftPanel } = this.state;
    this.setState({
      forceDisplayLeftPanel: !forceDisplayLeftPanel,
      forceDisplayRightPanel: false,
    });
  }

  onClickRightButton(e: ReactMouseEvent) {
    pauseEvent(e);
    const { forceDisplayRightPanel } = this.state;
    this.setState({
      forceDisplayLeftPanel: false,
      forceDisplayRightPanel: !forceDisplayRightPanel,
    });
  }

  onClickPreventBubble(e: ReactMouseEvent) {
    pauseEvent(e);
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
