/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import debounce from 'lodash/debounce';
import React, { Component, ComponentType } from 'react';
import styled from '../../foundation/styled-components';
import { noop } from '../../foundation/utils';
import _ from 'lodash';

type StickType = 'top' | 'bottom';

type ScrollerProps = {
  /**
   * The distance in pixels before the end of the items
   * that will trigger a scrollTop/scrollBottom event
   */
  thresholdUp: number;
  thresholdDown: number;
  throttle: number;
  initialScrollTop: number;
  stickTo: StickType;
  onScroll: (event: WheelEvent) => void;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  triggerScrollToOnMount: boolean;
};

type WithScrollerProps = ScrollerProps;
type ScrollerStates = {};
type ScrollerSnapShot = {
  atBottom: boolean;
  atTop: boolean;
  height: number;
};

type TScroller = {
  scrollToRow: (
    n: number,
    options?: ScrollIntoViewOptions | boolean,
    itemSelector?: string,
  ) => void;
};
const stickToBottomStyle = `
  // display: flex;
  // flex-direction: column;
  // && > div {
  //   margin-top:auto;
  // }
`;

const StyledScroller = styled<{ stickTo: StickType }, 'div'>('div')`
  overflow: auto;
  height: 100%;
  position: relative;
  ${({ stickTo }) => (stickTo === 'bottom' ? stickToBottomStyle : null)};
`;

function withScroller(Comp: ComponentType<any>) {
  return class Scroller extends Component<ScrollerProps, ScrollerStates>
    implements TScroller {
    static defaultProps = {
      thresholdUp: 100,
      thresholdDown: 0,
      throttle: 100,
      initialScrollTop: 0,
      stickTo: 'top',
      onScroll: noop,
      onScrollToTop: noop,
      onScrollToBottom: noop,
      triggerScrollToOnMount: false,
    };
    private _scrollElRef: React.RefObject<any> = React.createRef();

    private get _scrollEl(): HTMLElement {
      if (!this._scrollElRef.current) throw new Error();
      return this._scrollElRef.current;
    }

    constructor(props: ScrollerProps) {
      super(props);
      this._handleScroll = debounce(
        this._handleScroll.bind(this),
        props.throttle,
      );
    }

    render() {
      return (
        <StyledScroller ref={this._scrollElRef} stickTo={this.props.stickTo}>
          <Comp
            {...this.props}
            setRowVisible={this.scrollToRow}
            atBottom={this._isAtBottom}
          />
        </StyledScroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this.attachScrollListener();
    }

    getSnapshotBeforeUpdate() {
      const wrapper = this._scrollEl.lastElementChild;
      if (!wrapper) {
        return;
      }
      return {
        atTop: this._isAtTop(0),
        atBottom: this._isAtBottom(0),
        height: wrapper.getBoundingClientRect().height,
      };
    }

    componentDidUpdate(
      prevProps: ScrollerProps,
      prevState: ScrollerStates,
      snapShot?: ScrollerSnapShot,
    ) {
      if (!snapShot) {
        return;
      }
      const { atBottom, atTop, height } = snapShot;
      const { stickTo } = this.props;
      const wrapper = this._scrollEl.lastElementChild;
      if (!wrapper) {
        return;
      }
      if (stickTo === 'bottom') {
        if (atBottom) {
          this.scrollToRow(-1);
        }
        if (atTop) {
          const addedHeight = wrapper.getBoundingClientRect().height - height;
          this._scrollEl.scrollTop += addedHeight;
        }
      }
      if (stickTo === 'top') {
        if (atTop) {
          this.scrollToRow(0);
        }
      }
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

    private _handleScroll(event: WheelEvent) {
      this.props.onScroll(event);
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();
      const deltaY = event ? event.deltaY : 0;

      if (atTop || deltaY < 0) {
        this.props.onScrollToTop && this.props.onScrollToTop();
      }

      if (atBottom || deltaY > 0) {
        this.props.onScrollToBottom && this.props.onScrollToBottom();
      }
    }

    private _isAtTop(threshold = this.props.thresholdUp) {
      return this._scrollEl.scrollTop <= threshold;
    }

    private _isAtBottom = (threshold = this.props.thresholdDown) => {
      const scrollEl = this._scrollEl;
      return (
        0 >=
        scrollEl.scrollHeight -
          scrollEl.clientHeight -
          scrollEl.scrollTop -
          threshold
      );
    }

    scrollToRow = (
      n: number,
      options: ScrollIntoViewOptions | boolean = false,
      itemSelector: string = 'div',
    ) => {
      const listEl = this._scrollEl.lastElementChild;
      if (!listEl) {
        return;
      }
      const global = window as any;
      const doc = document as any;
      const isIE11 = !!global.MSInputMethodContext && !!doc.documentMode;
      if (n === -1 && !isIE11) {
        return window.requestAnimationFrame(() => listEl.scrollIntoView(false));
      }
      return window.requestAnimationFrame(() => {
        const rowEl = _(listEl.querySelectorAll(itemSelector)).nth(n);
        rowEl && rowEl.scrollIntoView(false);
      });
    }

    scrollToId = (
      id: string,
      options: ScrollIntoViewOptions | boolean = false,
    ) => {
      const listEl = this._scrollEl.firstElementChild;
      if (!listEl) {
        return;
      }
      const rowEl = listEl.querySelector(id);
      if (!rowEl) {
        return;
      }
      return window.requestAnimationFrame(() => rowEl.scrollIntoView(options));
    }
  };
}

export { withScroller, ScrollerProps, WithScrollerProps, TScroller };
