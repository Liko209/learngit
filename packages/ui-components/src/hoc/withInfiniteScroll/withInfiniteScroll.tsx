import React, { Component, ComponentType } from 'react';
import styled from '../../styled-components';
import { noop } from '../../utils';
// import styled from '../../styled-components';

interface InfiniteScrollProps {
  /**
   * The distance in pixels before the end of the items
   * that will trigger a scrollTop/scrollBottom event
   */
  threshold: number;
  initialScrollTop: number;
  onScrollToTop: (event: UIEvent) => void;
  onScrollToBottom: (event: UIEvent) => void;
}

interface InfiniteScrollStates {
  atTop: boolean;
  atBottom: boolean;
}

const Scroller = styled.div`
  overflow: auto;
  height: 100%;
`;

function withInfiniteScroll(Comp: ComponentType<any>) {
  class InfiniteScroll extends Component<
    InfiniteScrollProps,
    InfiniteScrollStates
  > {
    static defaultProps = {
      threshold: 100,
      initialScrollTop: 0,
      onScrollTop: noop,
      onScrollBottom: noop,
    };
    state = {
      atTop: false,
      atBottom: false,
    };
    scrollElRef: React.RefObject<HTMLElement> = React.createRef();

    private get _scrollEl() {
      if (!this.scrollElRef.current) throw new Error();
      return this.scrollElRef.current;
    }

    render() {
      return (
        <Scroller innerRef={this.scrollElRef}>
          <Comp {...this.props} />
        </Scroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
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

    private _handleScroll = (event: UIEvent) => {
      const prevAtTop = this.state.atTop;
      const prevAtBottom = this.state.atBottom;
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();

      if (atTop && !prevAtTop) {
        this.props.onScrollToTop && this.props.onScrollToTop(event);
      } else if (atBottom && !prevAtBottom) {
        this.props.onScrollToBottom && this.props.onScrollToBottom(event);
      }

      this.setState({
        atTop,
        atBottom,
      });
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
  }

  return InfiniteScroll;
}

export { withInfiniteScroll, InfiniteScrollProps };
