/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:09
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, CSSProperties } from 'react';
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
      const text = this._list[index];
      return <StaticCell title={text} style={style} key={index} />;
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
  const wrapperStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
  };
  return (
    <div style={wrapperStyle}>
      <div style={style}>
        <JuiVirtualList dataSource={dataSource} />
      </div>
    </div>
  );
});

storiesOf('Pattern/VirtualList', module).add('Dynamic VirtualList', () => {
  const part = ['Hello', 'This is title', 'A long text'];
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

      const { title, onLoad, ...rest } = this.props;
      return (
        <div {...rest}>
          <img
            onLoad={onLoad}
            src={source}
            style={{
              width: imageWidth,
            }}
          />
          {title}
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
  const wrapperStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
  };
  return (
    <div style={wrapperStyle}>
      <div style={style}>
        <JuiVirtualList dataSource={dynamicSource} />
      </div>
    </div>
  );
});
