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
      onScrollToTop: noop,
      onScrollToBottom: noop,
    };
    atTop = false;
    atBottom = false;
    private _scrollHeightBeforeUpdate = 0;

    scrollElRef: React.RefObject<HTMLElement> = React.createRef();

    private get _scrollEl() {
      if (!this.scrollElRef.current) throw new Error();
      return this.scrollElRef.current;
    }

    render() {
      return (
        <StyledScroller innerRef={this.scrollElRef}>
          <Comp {...this.props} />
        </StyledScroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this.atTop = this._isAtTop();
      this.atBottom = this._isAtBottom();
      this.attachScrollListener();
    }

    componentWillUpdate() {
      this._scrollHeightBeforeUpdate = this._scrollEl.scrollHeight;
      console.log('componentWillUpdate', this._scrollEl.scrollHeight);
    }

    componentDidUpdate() {
      console.log('componentDidUpdate', this._scrollEl.scrollHeight);
      console.log(
        'componentWillUnmount',
        this._scrollEl.scrollHeight - this._scrollHeightBeforeUpdate,
      );
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

    private _handleScroll = (event: UIEvent) => {
      const prevAtTop = this.atTop;
      const prevAtBottom = this.atBottom;
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();

      if (atTop && !prevAtTop) {
        this.props.onScrollToTop && this.props.onScrollToTop(event);
      } else if (atBottom && !prevAtBottom) {
        this.props.onScrollToBottom && this.props.onScrollToBottom(event);
      }

      this.atTop = this._isAtTop();
      this.atBottom = this._isAtBottom();
    }

    private _isAtTop() {
      return this._scrollEl.scrollTop <= this.props.threshold;
    }

    private _isAtBottom() {
      const scrollEl = this._scrollEl;
      return (
        scrollEl.scrollTop >=
        scrollEl.scrollHeight - scrollEl.clientHeight - this.props.threshold
      );
    }
  };
}

export { withScroller, ScrollerProps, WithScrollerProps };
