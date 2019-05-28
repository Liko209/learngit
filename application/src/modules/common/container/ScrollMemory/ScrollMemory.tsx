/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-28 16:05:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

type ScrollMemoryProps = {
  id: string | number;
};

class ScrollMemory extends Component<ScrollMemoryProps> {
  static _map = new Map<string | number, [number, number]>();

  componentDidMount() {
    this._scrollToLastPosition();
  }

  componentWillUnmount() {
    this._rememberCurrentPosition();
  }

  private _scrollToLastPosition = () => {
    const scrollEl = ReactDOM.findDOMNode(this);
    if (scrollEl instanceof HTMLElement) {
      const [top, left] = ScrollMemory._map.get(this.props.id) || [0, 0];
      scrollEl.scrollTop = top;
      scrollEl.scrollLeft = left;
    }
  }

  private _rememberCurrentPosition = () => {
    const scrollEl = ReactDOM.findDOMNode(this);
    if (scrollEl instanceof HTMLElement) {
      ScrollMemory._map.set(this.props.id, [
        scrollEl.scrollTop,
        scrollEl.scrollLeft,
      ]);
    }
  }

  render() {
    return <div style={{ display: 'none' }} />;
  }
}

export { ScrollMemory, ScrollMemoryProps };
