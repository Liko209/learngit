/*
 * @Author: isaac.liu
 * @Date: 2019-01-18 10:54:43
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactNode } from 'react';
import { IVirtualListDataSource } from 'jui/pattern/VirtualList';

type Props = {
  dataSource: IVirtualListDataSource;
};

class TableView extends Component<Props> {
  private _cellCache: Map<number, ReactNode> = new Map();
  componentWillReceiveProps() {}
  private _onScroll = (event: any) => {
    console.log(17, event);
  }
  render() {
    return (
      <div style={{ overflowY: 'auto' }} onScroll={this._onScroll}>
        <div />
      </div>
    );
  }
}

export { TableView };
