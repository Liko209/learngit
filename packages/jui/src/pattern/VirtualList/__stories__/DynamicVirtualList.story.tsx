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
  function generateURL() {
    const size = Math.round(10 + Math.random() * 10) * 10;
    const url = `https://via.placeholder.com/${size}`;
    return url;
  }
  const data: string[] = [];
  for (let i = 0; i < count; ++i) {
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

  class DataSource implements IVirtualListDataSource {
    private _list: string[];
    constructor(data: string[]) {
      this._list = data;
    }

    countOfCell() {
      return this._list.length;
    }

    overscanCount() {
      return 10;
    }

    observeCell() {
      return observeCell;
    }

    cellAtIndex({ index, style, onLoad }: JuiVirtualCellProps) {
      const text = `${index + 1}`;
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
    state = { cellIndex: -1 };
    _handleCellIndexChange = (event: ChangeEvent<HTMLInputElement>) => {
      const cellIndex = event.currentTarget.value;
      this.setState({ cellIndex });
      const { current } = this._listRef;
      if (current) {
        current.scrollToCell(parseInt(cellIndex, 10));
      }
    }
    render() {
      const { cellIndex } = this.state;
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
            height={550}
          />
        </div>
      );
    }
  }
  return <Content />;
});
