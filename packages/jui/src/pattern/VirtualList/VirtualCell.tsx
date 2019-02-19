/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 17:52:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  PureComponent,
  CSSProperties,
  RefObject,
  createRef,
} from 'react';
import styled from '../../foundation/styled-components';
import RO from 'resize-observer-polyfill';
type JuiVirtualCellOnLoadFunc = () => void;

type JuiVirtualCellProps<T> = {
  onLoad?: JuiVirtualCellOnLoadFunc;
  style: CSSProperties;
  index: number;
  item: T;
};

const JuiVirtualCellWrapper = styled.div``;

class JuiObservedCellWrapper<T> extends PureComponent<JuiVirtualCellProps<T>> {
  private _ref: RefObject<HTMLDivElement> = createRef();
  private _observer?: RO;
  private _handleResize = () => {
    const { onLoad } = this.props;
    onLoad && onLoad();
  }

  componentDidMount() {
    const { current } = this._ref;
    if (current) {
      this._observer = new RO(this._handleResize);
      this._observer.observe(current);
    }
  }

  componentWillUnmount() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  render() {
    const { children, style } = this.props;
    return (
      <div style={style}>
        <div ref={this._ref}> {children}</div>
      </div>
    );
  }
}

export {
  JuiVirtualCellOnLoadFunc,
  JuiVirtualCellProps,
  JuiVirtualCellWrapper,
  JuiObservedCellWrapper,
};
