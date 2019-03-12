/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import throttle from 'lodash/throttle';
import React, { ComponentType, PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { noop } from '../../foundation/utils';

type StickType = 'top' | 'bottom';

type ScrollerProps = {
  /**
   * The distance in pixels before the end of the items
   * that will trigger a scrollTop/scrollBottom event
   */
  thresholdUp: number;
  thresholdDown: number;
  throttle: number;
  stickTo: StickType;
  onScroll: (event: Event) => void;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  triggerScrollToOnMount: boolean;
};

type WithScrollerProps = ScrollerProps;
type ScrollerStates = {};

const StyledScroller = styled<{ stickTo: StickType }, 'div'>('div')`
  overflow: auto;
  height: 100%;
  position: relative;
  flex: 1;
`;

const ScrollerContext = React.createContext({
  scrollToRow: (n: number) => {},
  onListAsyncMounted: (el: React.RefObject<any>) => {},
});

function withScroller(Comp: ComponentType<any>) {
  return class Scroller extends PureComponent<ScrollerProps, ScrollerStates> {
    static defaultProps = {
      thresholdUp: 100,
      thresholdDown: 0,
      throttle: 100,
      stickTo: 'top',
      onScroll: noop,
      onScrollToTop: noop,
      onScrollToBottom: noop,
      triggerScrollToOnMount: false,
    };
    private _scrollElRef: React.RefObject<any> = React.createRef();
    private _lastScrollTop: number = 0;

    private get _scrollEl(): HTMLElement {
      return this._scrollElRef.current;
    }

    constructor(props: ScrollerProps) {
      super(props);
      this._handleScroll = throttle(
        this._handleScroll.bind(this),
        props.throttle,
      );
    }

    componentDidMount() {
      this.attachScrollListener();
    }

    componentWillUnmount() {
      this.detachScrollListener();
    }

    attachScrollListener() {
      this._scrollEl.addEventListener('scroll', this._handleScroll, false);
    }

    detachScrollListener() {
      this._scrollEl.removeEventListener('scroll', this._handleScroll, false);
    }

    private _handleScroll(event: Event) {
      if (this._scrollEl.scrollHeight === this._scrollEl.clientHeight) {
        return;
      }
      this.props.onScroll(event);
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();
      const currentScrollTop = this._scrollEl.scrollTop;
      const deltaY = this._scrollEl.scrollTop - this._lastScrollTop;
      this._lastScrollTop = currentScrollTop;
      if (atTop && deltaY < 0) {
        this.props.onScrollToTop && this.props.onScrollToTop();
      }
      if (atBottom && deltaY > 0) {
        this.props.onScrollToBottom && this.props.onScrollToBottom();
      }
    }

    private _isAtTop = (threshold = this.props.thresholdUp) => {
      const scrollEl = this._scrollEl;
      return scrollEl && scrollEl.scrollTop <= threshold;
    }

    private _isAtBottom = (threshold = this.props.thresholdDown) => {
      const scrollEl = this._scrollEl;
      return (
        scrollEl &&
        0 >=
          scrollEl.scrollHeight -
            scrollEl.clientHeight -
            scrollEl.scrollTop -
            threshold
      );
    }

    render() {
      const {
        stickTo,
        thresholdUp,
        thresholdDown,
        throttle,
        onScroll,
        onScrollToTop,
        onScrollToBottom,
        triggerScrollToOnMount,
        ...rest
      } = this.props;
      return (
        <StyledScroller ref={this._scrollElRef} stickTo={this.props.stickTo}>
          <Comp {...rest} atBottom={this._isAtBottom} atTop={this._isAtTop} />
        </StyledScroller>
      );
    }
  };
}

export { withScroller, ScrollerProps, WithScrollerProps, ScrollerContext };
