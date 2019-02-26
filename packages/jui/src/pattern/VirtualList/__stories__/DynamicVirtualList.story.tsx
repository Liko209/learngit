/*
 * @Author: isaac.liu
 * @Date: 2019-02-12 13:47:45
 * Copyright © RingCentral. All rights reserved.
 */

import React, {
  RefObject,
  createRef,
  CSSProperties,
  PureComponent,
  ChangeEvent,
} from 'react';
import { storiesOf } from '@storybook/react';
import { number, boolean } from '@storybook/addon-knobs';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellProps,
} from '..';

storiesOf('Pattern/VirtualList', module).add('Dynamic VirtualList', () => {
  let count = number('cell count', 1000);
  if (count < 0) {
    count = 1000;
  }
  const initialScrollToIndex = number('initial scroll to index', 300);
  const observeCell = boolean('observe cell', false);
  const stickToBottom = boolean('stick to bottom', false);

  function generateURL() {
    const size = Math.round(10 + Math.random() * 10) * 10;
    const url = `https://via.placeholder.com/${size}`;
    return url;
  }

  type CellProps = {
    title: string;
    url: string;
    onLoad?: () => void;
    style: CSSProperties;
  };

  class DynamicCell extends PureComponent<CellProps> {
    state = { flag: false };
    private _toggle = () => {
      if (observeCell) {
        this.setState({ flag: !this.state.flag });
      } else {
        this.setState({ flag: !this.state.flag }, this.props.onLoad);
      }
    }

    render() {
      const { title, url, onLoad, ...rest } = this.props;
      const { flag } = this.state;
      const cellContentWrapperStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
      };
      const content = (
        <div style={cellContentWrapperStyle}>
          {title}
          <img src={url} onLoad={onLoad} />
          <div>
            <button onClick={this._toggle}>Toggle</button>
            <div>{flag && <span>This is some content...</span>}</div>
          </div>
        </div>
      );
      return observeCell ? content : <div {...rest}>{content}</div>;
    }
  }

  class DataSource implements IVirtualListDataSource<number, string> {
    private _loading: boolean = false;
    private _items: string[] = [];

    addRandomCell = (n: number = 1) => {
      for (let i = 0; i < n; ++i) {
        this._items.push(generateURL());
      }
    }

    get(i: number) {
      return this._items[i];
    }

    hasMore() {
      return count > this.size();
    }

    size() {
      return this._items.length;
    }

    isLoading() {
      return this._loading;
    }

    loadInitialData = () => {
      return new Promise((resolve: Function) => {
        this._loading = true;
        setTimeout(() => {
          this.addRandomCell(20);
          this._loading = false;
          resolve();
        },         100);
      });
    }

    loadMore = () => {
      console.log('loadMore: ');
      return new Promise((resolve: Function) => {
        if (this._items.length >= count) {
          resolve();
        }
        this._loading = true;
        setTimeout(() => {
          this.addRandomCell(20);
          this._loading = false;
          resolve();
        },         1000);
      });
    }
  }

  const style: CSSProperties = {
    width: 400,
    height: 600,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
  };

  const dataSource = new DataSource();

  class Content extends PureComponent {
    private _listRef: RefObject<JuiVirtualList<number, string>> = createRef();
    state = {
      dataSource,
      cellIndex: initialScrollToIndex,
      loading: false,
    };

    private _handleCellIndexChange = (event: ChangeEvent<HTMLInputElement>) => {
      const cellIndex = parseInt(event.currentTarget.value, 10);
      this.setState({ cellIndex });
      const { current } = this._listRef;
      if (current) {
        current.scrollToCell(cellIndex);
      }
    }

    private _handleAddCell = () => {
      this.state.dataSource.addRandomCell(1);
      const { current } = this._listRef;
      if (current) {
        current.forceUpdate();
      }
    }

    private _rowRenderer = ({
      index,
      item,
      style,
      onLoad,
    }: JuiVirtualCellProps<string>) => {
      const text = `${index}`;
      const s = {
        ...style,
        borderBottom: '1px dashed',
      };
      return (
        <DynamicCell
          title={text}
          style={s}
          url={item}
          onLoad={onLoad}
          key={index}
        />
      );
    }

    render() {
      const { cellIndex } = this.state;
      return (
        <div style={style}>
          <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
            Scroll to index:
            <input
              value={cellIndex}
              type="number"
              onChange={this._handleCellIndexChange}
            />
          </div>
          <JuiVirtualList
            ref={this._listRef}
            stickToBottom={stickToBottom}
            dataSource={this.state.dataSource}
            rowRenderer={this._rowRenderer}
            width={400}
            height={500}
            observeCell={observeCell}
          />
          <div>
            <button onClick={this._handleAddCell}>Add cell</button>
          </div>
        </div>
      );
    }
  }
  return <Content />;
});
