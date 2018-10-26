/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import throttle from 'lodash/throttle';
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
  threshold: number;
  throttle: number;
  initialScrollTop: number;
  stickTo: StickType;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  triggerScrollToOnMount: boolean;
};

type WithScrollerProps = ScrollerProps;
type ScrollerStates = {};
type ScrollerSnapShot = {
  atBottom: boolean;
  atTop: boolean;
};
const stickToBottomStyle = `
  display: flex;
  flex-direction: column;
  && > div {
    margin-top:auto;
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
      throttle: 100,
      initialScrollTop: 0,
      stickTo: 'top',
      onScrollToTop: noop,
      onScrollToBottom: noop,
      triggerScrollToOnMount: false,
    };
    private _atTop = false;
    private _atBottom = false;
    private _scrollElRef: React.RefObject<any> = React.createRef();

    private get _scrollEl(): HTMLElement {
      if (!this._scrollElRef.current) throw new Error();
      return this._scrollElRef.current;
    }

    constructor(props: ScrollerProps) {
      super(props);
      this._handleScroll = throttle(
        this._handleScroll.bind(this),
        props.throttle,
      );
    }

    render() {
      return (
        <StyledScroller ref={this._scrollElRef} stickTo={this.props.stickTo}>
          <Comp {...this.props} setRowVisible={this.scrollToRow} />
        </StyledScroller>
      );
    }

    componentDidMount() {
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this.props.triggerScrollToOnMount &&
        this._handleScroll(new WheelEvent('wheel'));
      this._atTop = this._isAtTop();
      this._atBottom = this._isAtBottom();
      this.attachScrollListener();
    }
    getSnapshotBeforeUpdate() {
      return { atTop: this._isAtTop(0), atBottom: this._isAtBottom(0) };
    }
    componentDidUpdate(
      prevProps: ScrollerProps,
      prevState: ScrollerStates,
      snapShot: ScrollerSnapShot,
    ) {
      const { atBottom, atTop } = snapShot;
      const { stickTo } = this.props;
      if (atBottom && stickTo === 'bottom') {
        this.scrollToRow(-1);
      }
      if (atTop && stickTo === 'top') {
        this.scrollToRow(0);
      }
      this.attachScrollListener();
    }

    componentWillUnmount() {
      this.detachScrollListener();
    }

    attachScrollListener() {
      this._scrollEl.addEventListener('scroll', this._handleScroll, false);
      this._scrollEl.addEventListener('mousewheel', this._handleScroll, {
        capture: false,
        passive: true,
      });
    }

    detachScrollListener() {
      this._scrollEl.removeEventListener('scroll', this._handleScroll, false);
      this._scrollEl.removeEventListener('mousewheel', this._handleScroll, {
        capture: false,
      });
    }

    private _handleScroll(event: WheelEvent) {
      const prevAtTop = this._atTop;
      const prevAtBottom = this._atBottom;
      const atTop = this._isAtTop();
      const atBottom = this._isAtBottom();
      const deltaY = event ? event.deltaY : 0;

      if (atTop && (!prevAtTop || deltaY < 0)) {
        this.props.onScrollToTop && this.props.onScrollToTop();
      }

      if (atBottom && (!prevAtBottom || deltaY > 0)) {
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

    scrollToRow = (
      n: number,
      options: ScrollIntoViewOptions | boolean = false,
      itemSelector: string = 'div',
    ) => {
      const listEl = this._scrollEl.firstElementChild;
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

export { withScroller, ScrollerProps, WithScrollerProps };
