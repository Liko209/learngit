/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import {
  AutoSizer,
  List,
  ListRowProps,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { JuiVirtualCellOnLoadFunc } from './VirtualCell';

type JuiVirtualListProps = {
  dataSource: IVirtualListDataSource;
};

class JuiVirtualList extends Component<JuiVirtualListProps> {
  static MIN_CELL_HEIGHT: number = 44;
  static OVERSCAN_ROW_COUNT: number = 4;
  private _dataSource: IVirtualListDataSource;
  private _cache: CellMeasurerCache;
  private _listRef: RefObject<List> = createRef();

  constructor(props: JuiVirtualListProps) {
    super(props);
    const { dataSource } = props;
    this._dataSource = dataSource;
  }

  get dataSource() {
    return this._dataSource;
  }

  private get cache() {
    if (!this._cache) {
      this._cache = new CellMeasurerCache({
        minHeight: this.dataSource.minCellHeight
          ? this.dataSource.minCellHeight()
          : JuiVirtualList.MIN_CELL_HEIGHT,
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
        {({ measure }: { measure: JuiVirtualCellOnLoadFunc }) =>
          this._dataSource.cellAtIndex(index, style, measure)}
      </CellMeasurer>
    );
  }

  scrollToCell = (index: number) => {
    const { current } = this._listRef;
    if (current) {
      requestAnimationFrame(() => current.scrollToRow(index));
    }
  }

  scrollToPosition = (scrollTop: number) => {
    const { current } = this._listRef;
    if (current) {
      current.scrollToPosition(scrollTop);
    }
  }

  render() {
    const cellCount = this._dataSource.countOfCell();
    const fixedHeight = this._dataSource.fixedCellHeight
      ? this._dataSource.fixedCellHeight()
      : undefined;

    if (typeof fixedHeight !== 'undefined') {
      return (
        <AutoSizer>
          {({ width, height }: { width: number; height: number }) => (
            <List
              ref={this._listRef}
              height={height}
              width={width}
              rowCount={cellCount}
              rowHeight={fixedHeight}
              rowRenderer={this._renderFixedCell}
            />
          )}
        </AutoSizer>
      );
    }
    return (
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => {
          return (
            <List
              ref={this._listRef}
              deferredMeasurementCache={this.cache}
              estimatedRowSize={JuiVirtualList.MIN_CELL_HEIGHT}
              height={height}
              width={width}
              rowCount={cellCount}
              overscanRowCount={JuiVirtualList.OVERSCAN_ROW_COUNT}
              rowHeight={this.cache.rowHeight}
              rowRenderer={this._renderDynamicCell}
            />
          );
        }}
      </AutoSizer>
    );
  }
}

export { JuiVirtualList, JuiVirtualListProps };
