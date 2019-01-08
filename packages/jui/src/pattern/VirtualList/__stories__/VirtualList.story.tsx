/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:09
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef, CSSProperties } from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellOnLoadFunc,
  JuiVirtualCellProps,
} from '..';

storiesOf('Pattern/VirtualList', module).add('Static VirtualList', () => {
  let count = number('cell count', 1000);
  const cellIndex = number('scroll to cell', -1);
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

    cellAtIndex(index: number, style: CSSProperties) {
      const text = `${this._list[index]}-${index + 1}`;
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
  };
  class Content extends Component {
    private _listRef: RefObject<JuiVirtualList> = createRef();
    componentDidMount() {
      setTimeout(() => {
        const { current } = this._listRef;
        if (current) {
          current.scrollToCell(cellIndex);
        }
      },         100);
    }
    render() {
      return (
        <div style={style}>
          <JuiVirtualList ref={this._listRef} dataSource={dataSource} />
        </div>
      );
    }
  }
  return <Content />;
});

storiesOf('Pattern/VirtualList', module).add('Dynamic VirtualList', () => {
  const part = ['Hello', 'This is title', 'A long text'];
  const cellIndex = number('scroll to cell', -1);
  let count = number('cell count', 1000);
  if (count < 0) {
    count = 1000;
  }
  const data: string[] = Array(count)
    .fill(part)
    .flat();

  type CellProps = {
    title: string;
    index: number;
    onLoad?: () => void;
  };

  class Cell extends Component<CellProps & JuiVirtualCellProps> {
    render() {
      const imageWidth = 300;
      const imageHeight = ((this.props.index % 4) + 1) * 100;
      const source = `https://fillmurray.com/${imageWidth}/${imageHeight}`;

      const { title, index, onLoad, ...rest } = this.props;
      const footerStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        color: 'white',
      };
      return (
        <div {...rest}>
          <div style={{ height: '100%', position: 'relative' }}>
            <img
              onLoad={onLoad}
              src={source}
              style={{
                width: imageWidth,
              }}
            />
            <div style={footerStyle}>{`${title}-${index}`}</div>
          </div>
        </div>
      );
    }
  }

  class DynamicDataSource implements IVirtualListDataSource {
    private _list: string[];
    constructor(data: string[]) {
      this._list = data;
    }

    countOfCell() {
      return this._list.length;
    }

    cellAtIndex(
      index: number,
      style: CSSProperties,
      onLoad: JuiVirtualCellOnLoadFunc,
    ) {
      const text = this._list[index];
      return (
        <Cell
          title={text}
          index={index}
          style={style}
          key={index}
          onLoad={onLoad}
        />
      );
    }
  }

  const dynamicSource = new DynamicDataSource(data);

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
  };
  class Content extends Component {
    private _listRef: RefObject<JuiVirtualList> = createRef();
    componentDidMount() {
      setTimeout(() => {
        const { current } = this._listRef;
        if (current) {
          current.scrollToCell(cellIndex);
        }
      },         100);
    }
    render() {
      return (
        <div style={style}>
          <JuiVirtualList ref={this._listRef} dataSource={dynamicSource} />
        </div>
      );
    }
  }
  return <Content />;
});
