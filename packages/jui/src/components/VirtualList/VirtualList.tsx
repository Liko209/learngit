/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  AutoSizer,
  List,
  ListRowProps,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import { IVirtualListDataSource } from './VirtualListDataSource';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  private _dataSource: IVirtualListDataSource;
  private _cache: CellMeasurerCache;

  constructor(props: JuiVirtualListProps) {
    super(props);
    const { dataSource } = props;
    this._dataSource = dataSource;
  }

  get dataSource() {
    return this._dataSource;
  }

  get cache() {
    if (!this._cache) {
      this._cache = new CellMeasurerCache({
        minHeight: this.dataSource.minCellHeight
          ? this.dataSource.minCellHeight()
          : 44,
        fixedWidth: true,
      });
    }
    return this._cache;
  }

  private _renderFixedCell = ({ index, style }: ListRowProps) => {
    return this._dataSource.cellAtIndex(index, style);
  }

  private _renderDynamicCell = ({
    index,
    key,
    parent,
    style,
  }: ListRowProps) => {
    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => this._dataSource.cellAtIndex(index, style, measure)}
      </CellMeasurer>
    );
  }

  render() {
    const cellCount = this._dataSource.countOfCell();
    const fixedHeight = this._dataSource.fixedCellHeight
      ? this._dataSource.fixedCellHeight()
      : undefined;
    let content;
    if (typeof fixedHeight !== 'undefined') {
      content = (
        <AutoSizer>
          {({ width, height }) => (
            <List
              height={height}
              width={width}
              rowCount={cellCount}
              rowHeight={fixedHeight}
              rowRenderer={this._renderFixedCell}
            />
          )}
        </AutoSizer>
      );
    } else {
      content = (
        <AutoSizer>
          {({ width, height }) => {
            console.log(81, width, height);
            return (
              <List
                deferredMeasurementCache={this.cache}
                height={height}
                width={width}
                rowCount={cellCount}
                ooverscanRowCount={8}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this._renderDynamicCell}
              />
            );
          }}
        </AutoSizer>
      );
    }

    return content;
  }
}

export { JuiVirtualList, JuiVirtualListProps };
