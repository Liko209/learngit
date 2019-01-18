/*
 * @Author: isaac.liu
 * @Date: 2019-01-18 10:54:43
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  Component,
  CSSProperties,
  ReactNode,
  RefObject,
  createRef,
} from 'react';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { JuiVirtualListWrapper } from './VirtualListWrapper';
import { JuiRightRailLoadingMore } from '../RightShelf';

type Props = {
  dataSource: IVirtualListDataSource;
};

type IndexRange = {
  start: number;
  length: number;
};

type State = {
  visibleRange: IndexRange;
  loadingMore: boolean;
};

class TableView extends Component<Props, State> {
  static PAGE_SIZE = 20;
  private _wrapperRef: RefObject<any> = createRef();
  // private _cellCache: Map<number, ReactNode> = new Map();

  constructor(props: Props) {
    super(props);
    this.state = {
      visibleRange: {
        start: 0,
        length: TableView.PAGE_SIZE,
      },
      loadingMore: false,
    };
  }
  componentWillReceiveProps(nextProps: Props) {}

  private _calculateVisibleRange = (scrollTop: number): IndexRange => {
    const { dataSource } = this.props;
    const cellHeight = dataSource.fixedCellHeight!();
    const height = this._wrapperRef.current!.getBoundingClientRect().height;
    const start = Math.floor(scrollTop / cellHeight);
    const length = Math.ceil(height / cellHeight);
    return { length, start };
  }

  private _currentNeedLoadRange = (): IndexRange => {
    const { dataSource } = this.props;
    const { visibleRange } = this.state;
    const { start, length } = visibleRange;
    const end = start + length;
    if (dataSource.isRowLoaded) {
      let firstNotLoad = end;
      for (let i = start; i < end; ++i) {
        if (!dataSource.isRowLoaded(i)) {
          firstNotLoad = i;
          break;
        }
      }
      return { start: firstNotLoad, length: end - firstNotLoad };
    }
    return { start: end, length: 0 };
  }

  private _onScroll = (event: any) => {
    const { dataSource } = this.props;
    const { loadingMore } = this.state;
    const { target } = event;
    const scrollTop = (target as HTMLDivElement).scrollTop;
    console.log(17, scrollTop);
    const range = this._calculateVisibleRange(scrollTop);
    const rangeNeedToLoad = this._currentNeedLoadRange();
    if (dataSource.loadMore) {
      const { start, length } = rangeNeedToLoad;
      console.log(17777, rangeNeedToLoad);
      if (!loadingMore) {
        this.setState({ loadingMore: true });
        dataSource.loadMore(start, start + length).then(() => {
          this.setState({ loadingMore: false });
        });
      } else {
        event.preventDefault();
      }
    } else {
      this.setState({ visibleRange: range });
    }
  }

  render() {
    console.log(99999, 'render tableview');
    const { dataSource } = this.props;
    const { visibleRange, loadingMore } = this.state;
    const cells: ReactNode[] = [];
    const cellHeight = dataSource.fixedCellHeight!();
    const totalCount = dataSource.countOfCell();
    const totalHeight = cellHeight * totalCount;
    const { start, length } = visibleRange;
    const end = start + length;
    for (let i = start; i < end; ++i) {
      const cellStyle: CSSProperties = {
        position: 'absolute',
        height: cellHeight,
        width: '100%',
        top: i * cellHeight,
      };
      const cell = dataSource.cellAtIndex(i, cellStyle);
      if (cell) {
        // this._cellCache[i] = cell;
        cells.push(cell);
      } else {
        // TODO
      }
    }

    if (loadingMore) {
      const loaderWrapperStyle: CSSProperties = {
        position: 'absolute',
        width: '100%',
        top: cells.length * cellHeight,
      };

      cells.push(
        <div style={loaderWrapperStyle}>
          <JuiRightRailLoadingMore />
        </div>,
      );
    }

    return (
      <JuiVirtualListWrapper
        style={{ overflowY: 'auto', height: '100%' }}
        onScroll={this._onScroll}
        ref={this._wrapperRef}
      >
        <div
          style={{ position: 'relative', width: '100%', height: totalHeight }}
        >
          {cells}
        </div>
      </JuiVirtualListWrapper>
    );
  }
}

export { TableView };
