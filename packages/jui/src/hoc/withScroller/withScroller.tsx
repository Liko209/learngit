/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:47
 * Copyright © RingCentral. All rights reserved.
 */
import debounce from 'lodash/debounce';
import React, { ComponentType, PureComponent } from 'react';
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
  onListAsyncMounted: (el: React.RefObject<HTMLElement>) => void;
};

const StyledScroller = styled<{ stickTo: StickType }, 'div'>('div')`
  overflow: auto;
  height: 100%;
  position: relative;
`;

const ScrollerContext = React.createContext({
  scrollToRow: (n: number) => {},
  onListAsyncMounted: (el: React.RefObject<any>) => {},
});

function withScroller(Comp: ComponentType<any>) {
  return class Scroller extends PureComponent<ScrollerProps, ScrollerStates>
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
    private _list: HTMLElement | null;
    private _previousPosition: ScrollerSnapShot;

    private get _scrollEl(): HTMLElement {
      return this._scrollElRef.current;
    }

    constructor(props: ScrollerProps) {
      super(props);
      this._handleScroll = debounce(
        this._handleScroll.bind(this),
        props.throttle,
      );
    }
    onListAsyncMounted = (list: React.RefObject<HTMLElement>) => {
      /* This function is called especially when the list is mounted after withScroller mounted*/
      this._list = list.current;
    }

    componentDidMount() {
      if (this._list) {
        this._list = this._scrollEl.querySelector('section');
      }
      this._scrollEl.scrollTop = this.props.initialScrollTop;
      this.attachScrollListener();
    }

    getSnapshotBeforeUpdate() {
      if (!this._list) {
        return {};
      }
      this._previousPosition = {
        atTop: this._isAtTop(0),
        atBottom: this._isAtBottom(0),
        height: this._list.getBoundingClientRect().height,
      };
      return this._previousPosition;
    }

    componentDidUpdate(
      prevProps: ScrollerProps,
      prevState: ScrollerStates,
      snapShot?: ScrollerSnapShot,
    ) {
      if (!snapShot) {
        return;
      }
      this.stickToCurrentPosition(snapShot);
    }

    stickToCurrentPosition(snapShot: ScrollerSnapShot) {
      const { atBottom, atTop, height } = snapShot;
      const { stickTo } = this.props;
      if (!this._list) {
        return;
      }
      if (stickTo === 'bottom') {
        if (atBottom) {
          this.scrollToRow(-1);
        }
        if (atTop) {
          const addedHeight =
            this._list.getBoundingClientRect().height - height;
          this._scrollEl.scrollTop += addedHeight;
        }
      }
      if (stickTo === 'top') {
        if (atTop) {
          this.scrollToRow(0);
        }
      }
    }

    componentWillUnmount() {
      this.detachScrollListener();
      this._list = null;
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
      options: ScrollIntoViewOptions | boolean = {
        behavior: 'smooth',
        block: 'end',
      },
      itemSelector: string = 'div',
    ) => {
      const listEl = this._list;
      if (!listEl) {
        return;
      }
      const global = window as any;
      const doc = document as any;
      const isIE11 = !!global.MSInputMethodContext && !!doc.documentMode;
      if (n === -1 && !isIE11) {
        return window.requestAnimationFrame(() => listEl.scrollIntoView(false));
      }
      return window.setTimeout(() => {
        const rowEl = _(listEl.children).nth(n);
        rowEl && rowEl.scrollIntoView(false);
      },                       0);
    }

    scrollToId = (
      id: string,
      options: ScrollIntoViewOptions | boolean = false,
    ) => {
      const listEl = this._list;
      if (!listEl) {
        return;
      }
      const rowEl = listEl.querySelector(id);
      if (!rowEl) {
        return;
      }
      return window.requestAnimationFrame(() => rowEl.scrollIntoView(options));
    }
    private _context = {
      scrollToRow: this.scrollToRow,
      onListAsyncMounted: this.onListAsyncMounted,
    };
    render() {
      return (
        <StyledScroller ref={this._scrollElRef} stickTo={this.props.stickTo}>
          <ScrollerContext.Provider value={this._context}>
            <Comp
              {...this.props}
              setRowVisible={this.scrollToRow}
              atBottom={this._isAtBottom}
            />
          </ScrollerContext.Provider>
        </StyledScroller>
      );
    }
  };
}

export {
  withScroller,
  ScrollerProps,
  WithScrollerProps,
  TScroller,
  ScrollerContext,
};
