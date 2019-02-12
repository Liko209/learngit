/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:09
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  RefObject,
  createRef,
  CSSProperties,
  PureComponent,
} from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import uuid from 'uuid';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellProps,
} from '..';
import { FileItem } from './FileItem';
import { FileItemProps } from './types';

storiesOf('Pattern/VirtualList', module).add('Static VirtualList', () => {
  let count = number('cell count', 1000);
  if (count < 0) {
    count = 1000;
  }
  const part = ['Hello', 'This is title', 'A long text'];
  const data: string[] = Array(count)
    .fill(part)
    .flat();

  type CellProps = {
    title: string;
    onLoad?: () => void;
    style: CSSProperties;
  };

  const StaticCell = ({ title, ...rest }: CellProps) => (
    <div {...rest}>{title}</div>
  );

  class DataSource implements IVirtualListDataSource {
    private _list: string[];
    constructor(data: string[]) {
      this._list = data;
    }

    countOfCell() {
      return this._list.length;
    }

    cellAtIndex({ index, style }: JuiVirtualCellProps) {
      const text = `${this._list[index]}-${index}`;
      const s = {
        ...style,
        borderBottom: '1px dashed',
      };
      return <StaticCell title={text} style={s} key={index} />;
    }

    fixedCellHeight(): number {
      return 44;
    }
  }

  const dataSource = new DataSource(data);

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };
  type States = {
    visibleRange: { startIndex: number; stopIndex: number };
  };
  class Content extends PureComponent<{}, States> {
    private _listRef: RefObject<JuiVirtualList> = createRef();
    state = { visibleRange: { startIndex: -1, stopIndex: -1 } };

    componentDidMount() {
      setTimeout(() => {
        const { current } = this._listRef;
        if (current) {
          // current.scrollToCell(cellIndex);
        }
      },         100);
    }

    private _handleBeforeRowsRendered = ({ startIndex, stopIndex }) => {
      this.setState({
        visibleRange: {
          startIndex,
          stopIndex,
        },
      });
    }

    private _renderVirtualList() {
      return (
        <div style={style}>
          <JuiVirtualList
            ref={this._listRef}
            dataSource={dataSource}
            width={400}
            height={400}
            onBeforeRowsRendered={this._handleBeforeRowsRendered}
          />
        </div>
      );
    }

    private _renderVisibleRange() {
      const { startIndex, stopIndex } = this.state.visibleRange;
      return (
        <div>
          Visible Range: {startIndex}-{stopIndex}
        </div>
      );
    }

    render() {
      return (
        <>
          {this._renderVirtualList()}
          {this._renderVisibleRange()}
        </>
      );
    }
  }
  return <Content />;
});

storiesOf('Pattern/VirtualList', module).add('Infinite VirtualList', () => {
  let count = number('cell count', 1000);
  if (count < 0) {
    count = 1000;
  }
  const part = ['Hello', 'This is title', 'A long text'];

  type CellProps = {
    title: string;
    onLoad?: () => void;
  };

  const StaticCell = ({ title, ...rest }: CellProps) => (
    <div {...rest}>{title}</div>
  );

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };
  class Content extends PureComponent implements IVirtualListDataSource {
    private _list: string[] = Array(5)
      .fill(part)
      .flat();
    state = { isLoading: false };
    countOfCell = () => {
      return this._list.length;
    }

    cellAtIndex = ({ index, style }: JuiVirtualCellProps) => {
      const text = `${this._list[index]}-${index}`;
      return (
        <div key={index} style={style}>
          <StaticCell title={text} />
        </div>
      );
    }

    isRowLoaded = (index: number) => {
      return index < this._list.length;
    }

    loadMore = async (startIndex: number, endIndex: number) => {
      this.setState({ isLoading: true });
      const p = new Promise((resolve: any) => {
        setTimeout(() => {
          const array: string[] = Array(endIndex - startIndex).fill('XXX');
          this._list = this._list.concat(array);
          resolve();
          this.setState({ isLoading: false });
        },         1000);
      });
      return await p;
    }

    fixedCellHeight(): number {
      return 44;
    }

    moreLoader() {
      return <div>Loading ...</div>;
    }

    render() {
      return (
        <div style={style}>
          <JuiVirtualList
            dataSource={this}
            threshold={10}
            isLoading={this.state.isLoading}
            width={400}
            height={400}
          />
        </div>
      );
    }
  }
  return <Content />;
});

storiesOf('Pattern/VirtualList', module).add('Empty VirtualList', () => {
  class EmptyDataSource implements IVirtualListDataSource {
    countOfCell() {
      return 0;
    }

    cellAtIndex() {
      return <div />;
    }

    renderEmptyContent() {
      const style: CSSProperties = {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
      };
      return <div style={style}>This is empty place holder</div>;
    }
  }

  const source = new EmptyDataSource();
  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };
  return (
    <div style={style}>
      <JuiVirtualList dataSource={source} width={400} height={400} />
    </div>
  );
});

storiesOf('Pattern/VirtualList', module).add('Load VirtualList', () => {
  class DataSource implements IVirtualListDataSource {
    private _list: string[] = [];
    constructor() {
      for (let i = 0; i < 100; ++i) {
        this._list.push(uuid.v4());
      }
    }
    countOfCell() {
      return 10000;
    }

    cellAtIndex({ index, style }: JuiVirtualCellProps) {
      const text = this._list[index];
      const placeHolderStyle = {
        display: 'flex',
        height: '1em',
        backgroundColor: '#DDD',
        marginLeft: '10px',
        marginRight: '10px',
      };
      if (text === '') {
        return (
          <div key={index} style={style}>
            <div style={placeHolderStyle} />
          </div>
        );
      }
      return (
        <div key={index} style={style}>
          {text}
        </div>
      );
    }

    overscanCount() {
      return 10;
    }

    loadMore = (startIndex: number, stopIndex: number) => {
      for (let i = startIndex; i < stopIndex; ++i) {
        this._list.push('');
      }
      return new Promise((resolve: any) => {
        setTimeout(() => {
          for (let i = startIndex; i < stopIndex; ++i) {
            this._list[i] = uuid.v4();
          }
          resolve();
        },         1000);
      });
    }

    isRowLoaded = (index: number) => {
      return this._list.length > index;
    }
  }

  const source = new DataSource();
  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };
  return (
    <div style={style}>
      <JuiVirtualList dataSource={source} width={400} height={400} />
    </div>
  );
});

storiesOf('Pattern/VirtualList', module).add('Right Shelf Files', () => {
  const count = number('cell count', 10000);
  class DataSource implements IVirtualListDataSource {
    private _list: FileItemProps[] = [];
    constructor() {
      for (let i = 0; i < 100; ++i) {
        const item: FileItemProps = {
          name: uuid.v4(),
          subtitle: Math.random().toString(16),
        };
        this._list.push(item);
      }
    }
    countOfCell() {
      return count;
    }

    fixedCellHeight() {
      return 52;
    }

    cellAtIndex({ index, style }: JuiVirtualCellProps) {
      const item = this._list[index];
      const placeHolderStyle = {
        display: 'flex',
        height: '1em',
        backgroundColor: '#DDD',
        marginLeft: '10px',
        marginRight: '10px',
      };
      if (!item || Object.keys(item).length === 0) {
        return (
          <div key={index} style={style}>
            <div style={placeHolderStyle} />
          </div>
        );
      }
      return (
        <div key={index} style={style}>
          <FileItem {...item} />
        </div>
      );
    }

    overscanCount() {
      return 20;
    }

    loadMore = (startIndex: number, stopIndex: number) => {
      for (let i = startIndex; i < stopIndex; ++i) {
        this._list.push({} as FileItemProps);
      }
      return new Promise((resolve: any) => {
        setTimeout(() => {
          for (let i = startIndex; i < stopIndex; ++i) {
            const item: FileItemProps = {
              name: uuid.v4(),
              subtitle: Math.random().toString(16),
            };
            this._list[i] = item;
          }
          resolve();
        },         10);
      });
    }

    isRowLoaded = (index: number) => {
      return this._list.length > index;
    }
  }

  const source = new DataSource();
  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };
  const Comp = () => (
    <div style={style}>
      <JuiVirtualList dataSource={source} width={400} height={400} />
    </div>
  );
  return <Comp />;
});
