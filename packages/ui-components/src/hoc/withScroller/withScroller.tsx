/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import styled from '../../styled-components';
import { noop } from '../../utils';

type ScrollerProps = {
  /**
   * The distance in pixels before the end of the items
   * that will trigger a scrollTop/scrollBottom event
   */
  threshold: number;
  initialScrollTop: number;
  stickTo: 'top' | 'bottom';
  onScrollToTop: (event: UIEvent) => void;
  onScrollToBottom: (event: UIEvent) => void;
};
type WithScrollerProps = ScrollerProps;

type ScrollerStates = {};

const StyledScroller = styled.div`
  overflow: auto;
  height: 100%;
`;

function withScroller(Comp: ComponentType<any>) {
  return class Scroller extends Component<ScrollerProps, ScrollerStates> {
    static defaultProps = {
      threshold: 100,
      initialScrollTop: 0,
      stickTo: 'top',
      onScrollToTop: noop,
      onScrollToBottom: noop,
    };
    private _atTop = false;
    private _atBottom = false;
    private _atAbsoluteTopBeforeUpdate = false;
    private _atAbsoluteBottomBeforeUpdate = false;
    private _scrollHeightBeforeUpdate = 0;
    private _scrollElRef: React.RefObject<HTMLElement> = React.createRef();

    private get _scrollEl() {
      if (!this._scrollElRef.current) throw new Error();
      return this._scrollElRef.current;
    }

    render() {
      return (
        <StyledScroller innerRef={this._scrollElRef}>
          <Comp {...this.props} />
        </StyledScroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
      this.attachScrollListener();
    }

    componentWillUpdate() {
      this._scrollHeightBeforeUpdate = this._scrollEl.scrollHeight;
      this._atAbsoluteBottomBeforeUpdate = this._isAtBottom(0);
      this._atAbsoluteTopBeforeUpdate = this._isAtTop(0);
      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
    }

    componentDidUpdate() {
      this._handleStickTo();
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

    private _handleStickTo() {
      //
      // The default behavior of browser is stick to top, not stick to bottom.
      // When user want stick to bottom, we need to control the scrollTop
      //
      if (this._shouldStickToBottom()) {
        const scrollEl = this._scrollEl;
        const delta = scrollEl.scrollHeight - this._scrollHeightBeforeUpdate;
        scrollEl.scrollBy(0, delta);
      }
    }

    private _handleScroll = (event: UIEvent) => {
      const prevAtTop = this._atTop;
      const prevAtBottom = this._atBottom;
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();

      if (atTop && !prevAtTop) {
        this.props.onScrollToTop && this.props.onScrollToTop(event);
      } else if (atBottom && !prevAtBottom) {
        this.props.onScrollToBottom && this.props.onScrollToBottom(event);
      }

      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
    }

    private _shouldStickToBottom() {
      return (
        this.props.stickTo === 'bottom' && this._atAbsoluteBottomBeforeUpdate
      );
    }

    private _shouldMoveDelta() {
      return this.props.stickTo === 'bottom' && this._atAbsoluteTopBeforeUpdate;
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
