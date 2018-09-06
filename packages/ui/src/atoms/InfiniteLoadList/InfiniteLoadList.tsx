import React, { Component } from 'react';
import styled from 'styled-components';

let supportsPassive = false;
const noop = () => {};
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
    },
  });
  window.addEventListener('test', noop, opts);
} catch (e) { /* pass */ }

interface IProps {
  flipped: boolean;
  reversed?: boolean;
  scrollLoadThreshold: number;
  shouldTriggerLoad: Function;
  onInfiniteLoad: Function;
  loadingSpinnerDelegate?:React.ReactElement<any>;
  className?: string;
  children?: React.ReactNode;
  returnScrollable: (el:HTMLElement) => any;
}
interface IState{
  isInfiniteLoading:boolean;
}
const ScrollContainer = styled.div`
  height:100%;
  width:100%;
  overflow-x:hidden;
  overflow-y:auto;
`;

const ListContainer = styled<{flipped:boolean}, 'div'>('div')`
  display:flex;
  flex-grow:1;
  flex-direction:column;
  @media all and (-ms-high-contrast:none){
    .foo { color: green } /* IE10 */
    *::-ms-backdrop, .foo { color: red } /* IE11 */
}
  min-height:100%;
  justify-content:${({ flipped }) => (flipped ? 'flex-end' :'flex-start')};
`;

const Pad = styled.section`
  flex: 20px 1 0;
  display:block;
  width:100%;
`;

export default class InfiniteLoadList extends Component<IProps, IState> {
  scrollHeight?:number ;
  rafRequestId:number ;
  scrollTop?:number;
  scrollable:HTMLElement;
  state :IState = { isInfiniteLoading:false };
  static defaultProps = {
    flipped: false,
    scrollLoadThreshold: 10,
    shouldTriggerLoad: () => { return true; },
    className: '',
  };
  componentDidMount() {
    const heightDifference = this.props.flipped
      ? this.scrollable.scrollHeight - this.scrollable.clientHeight
      : 0;

    this.scrollable.scrollTop = heightDifference;
    this.scrollTop = heightDifference;
    if (supportsPassive) {
      this.scrollable.addEventListener('scroll', this.onScroll, { passive: true });
    } else {
      this.rafRequestId = window.requestAnimationFrame(this.pollScroll);
    }

    // upper ref
    if (typeof this.props.returnScrollable === 'function') this.props.returnScrollable(this.scrollable);
  }

  componentDidUpdate() {
    this.updateScrollTop();
  }

  componentWillUnmount() {
    this.scrollable.removeEventListener<'scroll'>('scroll', this.onScroll);
    window.cancelAnimationFrame(this.rafRequestId);
  }

  onScroll = () => {
    if (this.scrollable.scrollTop !== this.scrollTop) {
      if (this.shouldTriggerLoad()) {
        this.setState({ isInfiniteLoading: true });
        const p = this.props.onInfiniteLoad();
        p.then(() => this.setState({ isInfiniteLoading: false }));
      }
      this.updateScrollTop();
    }
  }

  pollScroll = () => {
    this.onScroll();
    this.rafRequestId = window.requestAnimationFrame(this.pollScroll);
  }

  isPassedThreshold = (flipped:boolean, scrollLoadThreshold:number, scrollTop:number, scrollHeight:number, clientHeight:number) => {
    return flipped
      ? scrollTop <= scrollLoadThreshold
      : scrollTop >= (scrollHeight - clientHeight - scrollLoadThreshold);
  }
  forwardScrollable = (ref:HTMLElement) => {
    this.scrollable = ref;
  }
  shouldTriggerLoad() {
    const passedThreshold = this.isPassedThreshold(
      this.props.flipped,
      this.props.scrollLoadThreshold,
      this.scrollable.scrollTop,
      this.scrollable.scrollHeight,
      this.scrollable.clientHeight);
    return passedThreshold && !this.state.isInfiniteLoading && this.props.shouldTriggerLoad();
  }

  updateScrollTop() {
    // todo this is only the happy path
    let newScrollTop = this.scrollable.scrollTop + (this.props.flipped
      ? this.scrollable.scrollHeight - (this.scrollHeight || 0)
      : 0);

    // if scrollHeightDifference is > 0 then something was removed from list
    const scrollHeightDifference = this.scrollHeight ? this.scrollHeight - this.scrollable.scrollHeight : 0;

    // if something was removed from list we need to include this difference in new scroll top
    if (this.props.flipped && scrollHeightDifference > 0) {
      newScrollTop += scrollHeightDifference;
    }

    if (newScrollTop !== this.scrollable.scrollTop) {
      this.scrollable.scrollTop = newScrollTop;
    }

    this.scrollTop = this.scrollable.scrollTop;
    this.scrollHeight = this.scrollable.scrollHeight;

    // Setting scrollTop can halt user scrolling (and disables hardware acceleration)

    // Both cases - flipped and refular - have cases where the content expands in the proper direction,
    // or the content expands in the wrong direciton. Either history or new message in both cases.
    // We are only handling half of the cases. Or an image resized above or below us.
  }

  render() {
    let loadSpinner;
    if (this.props.loadingSpinnerDelegate) {
      loadSpinner = (
      <div>
        {this.state.isInfiniteLoading ? this.props.loadingSpinnerDelegate : null}
      </div>
      );
    }
    return (
      <ScrollContainer innerRef={this.forwardScrollable}>
      <ListContainer flipped={this.props.flipped}>
          {this.props.flipped ? loadSpinner : null}
          {this.props.flipped && this.props.shouldTriggerLoad ? <Pad/> :null}
          {this.props.children}
          {this.props.flipped ? null : loadSpinner}
      </ListContainer>
      </ScrollContainer >
    );
  }
}
export { InfiniteLoadList, IProps as IInfiniteLoadListProps };
