/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import styled from '../../styled-components';
import { noop } from '../../utils';

type StickType = 'top' | 'bottom';

type ScrollerProps = {
  /**
   * The distance in pixels before the end of the items
   * that will trigger a scrollTop/scrollBottom event
   */
  threshold: number;
  initialScrollTop: number;
  stickTo: StickType;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  triggerScrollToOnMount: boolean;
};
type WithScrollerProps = ScrollerProps;
type ScrollerStates = {};

const stickToBottomStyle = `
  display: flex;
  flex-direction: column-reverse;
  && > div:nth-child(1) {
    order: 3;
  }
  && > div:nth-child(2) {
    order: 2;
  }
  && > div:nth-child(3) {
    order: 1;
  }
`;

const StyledScroller = styled<{ stickTo: StickType }, 'div'>('div')`
  overflow: auto;
  height: 100%;
  ${({ stickTo }) => (stickTo === 'bottom' ? stickToBottomStyle : null)};
`;

function withScroller(Comp: ComponentType<any>) {
  return class Scroller extends Component<ScrollerProps, ScrollerStates> {
    static defaultProps = {
      threshold: 100,
      initialScrollTop: 0,
      stickTo: 'top',
      onScrollToTop: noop,
      onScrollToBottom: noop,
      triggerScrollToOnMount: false,
    };
    private _atTop = false;
    private _atBottom = false;
    private _scrollElRef: React.RefObject<HTMLElement> = React.createRef();

    private get _scrollEl() {
      if (!this._scrollElRef.current) throw new Error();
      return this._scrollElRef.current;
    }

    render() {
      return (
        <StyledScroller
          innerRef={this._scrollElRef}
          stickTo={this.props.stickTo}
        >
          <Comp {...this.props} />
        </StyledScroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this.props.triggerScrollToOnMount && this._handleScroll();
      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
      this.attachScrollListener();
    }

    componentDidUpdate() {
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

    private _handleScroll = () => {
      const prevAtTop = this._atTop;
      const prevAtBottom = this._atBottom;
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();

      if (atTop && !prevAtTop) {
        this.props.onScrollToTop && this.props.onScrollToTop();
      }

      if (atBottom && !prevAtBottom) {
        this.props.onScrollToBottom && this.props.onScrollToBottom();
      }

      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
    }

    private _isAtTop(threshold = this.props.threshold) {
      return this._scrollEl.scrollTop <= threshold;
    }

    private _isAtBottom(threshold = this.props.threshold) {
      const scrollEl = this._scrollEl;
      return (
        0 >=
        scrollEl.scrollHeight -
          scrollEl.clientHeight -
          scrollEl.scrollTop -
          threshold
      );
    }
  };
}

export { withScroller, ScrollerProps, WithScrollerProps };
