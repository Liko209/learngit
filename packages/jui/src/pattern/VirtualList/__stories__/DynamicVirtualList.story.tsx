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
  const observeCell = boolean('observe cell', false);
  const stickToBottom = boolean('stick to bottom', false);
  function generateURL() {
    const size = Math.round(10 + Math.random() * 10) * 10;
    const url = `https://via.placeholder.com/${size}`;
    return url;
  }
  const initCount = 40;
  const data: string[] = [];
  for (let i = 0; i < initCount; ++i) {
    data.push(generateURL());
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
            {flag && <div>This is some content...</div>}
          </div>
        </div>
      );
      return observeCell ? content : <div {...rest}>{content}</div>;
    }
  }

  let dataSourceLoading = false;

  class DataSource implements IVirtualListDataSource {
    private _list: string[];
    constructor(data: string[]) {
      this._list = data;
    }

    addRandomCell = (count: number = 1) => {
      for (let i = 0; i < count; ++i) {
        this._list.push(generateURL());
      }
    }

    countOfCell() {
      return this._list.length;
    }

    overscanCount() {
      return 0;
    }

    observeCell() {
      return observeCell;
    }

    stickToBottom() {
      return stickToBottom;
    }

    loadMore = async () => {
      if (this._list.length >= count) {
        return;
      }
      dataSourceLoading = true;
      return new Promise((resolve: any) => {
        setTimeout(() => {
          this.addRandomCell(20);
          dataSourceLoading = false;
          resolve();
        },         1000);
      });
    }

    moreLoader = () => <div>Loading ...</div>;

    cellAtIndex({ index, style, onLoad }: JuiVirtualCellProps) {
      const text = `${index}`;
      const s = {
        ...style,
        borderBottom: '1px dashed',
      };
      return (
        <DynamicCell
          title={text}
          style={s}
          url={this._list[index]}
          onLoad={onLoad}
          key={index}
        />
      );
    }
  }

  const dataSource = new DataSource(data);

  const style: CSSProperties = {
    width: 400,
    height: 600,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
  };
  class Content extends PureComponent {
    private _listRef: RefObject<JuiVirtualList> = createRef();
    state = { cellIndex: -1, loading: false };

    private _handleCellIndexChange = (event: ChangeEvent<HTMLInputElement>) => {
      const cellIndex = event.currentTarget.value;
      this.setState({ cellIndex });
      const { current } = this._listRef;
      if (current) {
        current.scrollToCell(parseInt(cellIndex, 10));
      }
    }

    private _handleAddCell = () => {
      dataSource.addRandomCell();
      window.requestAnimationFrame(() => this._listRef.current.forceUpdate());
    }

    private _simulateLoadData = () => {
      this.setState({ loading: true });
      setTimeout(() => {
        dataSource.addRandomCell(20);
        this.setState({ loading: false });
      },         500);
    }

    render() {
      const { cellIndex, loading } = this.state;
      return (
        <div style={style}>
          <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
            Scroll to index:
            <input value={cellIndex} onChange={this._handleCellIndexChange} />
          </div>
          <JuiVirtualList
            ref={this._listRef}
            dataSource={dataSource}
            width={400}
            height={500}
            isLoading={loading || dataSourceLoading}
          />
          <div>
            <button onClick={this._handleAddCell}>Add cell</button>
            <button onClick={this._simulateLoadData}>Load more data</button>
          </div>
        </div>
      );
    }
  }
  return <Content />;
});
