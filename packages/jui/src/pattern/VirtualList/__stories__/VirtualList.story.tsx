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
import { number, boolean } from '@storybook/addon-knobs';
import uuid from 'uuid';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellProps,
  JuiVirtualListRowsRenderInfo,
} from '..';
import {
  AbstractDemoInfiniteDataSource,
  DemoInfiniteDataSource,
  DemoStaticDataSource,
} from './DemoDataSource';
import { FileItem } from './FileItem';
import { FileItemProps } from './types';

const textItemRenderer = ({
  index,
  item,
  style,
}: JuiVirtualCellProps<string>) => {
  const text = `${index}. ${item}`;
  const s = {
    ...style,
    borderBottom: '1px dashed',
  };
  return (
    <div key={index} style={s}>
      {text}
    </div>
  );
};

const noContentRenderer = () => {
  const style: CSSProperties = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '30px',
  };
  return <div style={style}>This is empty place holder</div>;
};

storiesOf('Pattern/VirtualList', module).add('Static VirtualList', () => {
  const total = Math.max(number('total item count', 1000), 0);

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };

  type States = {
    dataSource: DemoStaticDataSource;
    visibleRange: { startIndex: number; stopIndex: number };
  };

  const dataSource = new DemoStaticDataSource();
  dataSource.initDemoData(total);

  class Content extends PureComponent<{}, States> {
    private _listRef: RefObject<JuiVirtualList<number, string>> = createRef();
    state = {
      dataSource,
      visibleRange: { startIndex: -1, stopIndex: -1 },
    };

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
            dataSource={this.state.dataSource}
            width={400}
            height={400}
            fixedCellHeight={44}
            rowRenderer={textItemRenderer}
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
  const total = Math.max(number('total item count', 1000), 0);
  const overscan = number('overscan', 10);
  const threshold = number('threshold', 15);
  const dataLoadTime = number('data load time', 100);
  const stickToBottom = boolean('stick to bottom', false);

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };

  type IndexRange = { startIndex: number; stopIndex: number };

  type States = {
    dataSource: IVirtualListDataSource<any, any>;
    visibleRange: IndexRange;
    renderedRange: IndexRange;
    loadedRange: IndexRange;
  };

  const dataSource = new DemoInfiniteDataSource(total, dataLoadTime);

  class Content extends PureComponent<{}, States> {
    state: States = {
      dataSource,
      visibleRange: { startIndex: 0, stopIndex: -1 },
      renderedRange: { startIndex: 0, stopIndex: -1 },
      loadedRange: { startIndex: 0, stopIndex: -1 },
    };

    private _moreLoader = () => {
      return <div>Loading ...</div>;
    }

    private _handleBeforeRowsRendered = ({
      startIndex,
      stopIndex,
      overscanStartIndex,
      overscanStopIndex,
    }: JuiVirtualListRowsRenderInfo) => {
      this.setState({
        visibleRange: { startIndex, stopIndex },
        renderedRange: {
          startIndex: overscanStartIndex,
          stopIndex: overscanStopIndex,
        },
      });
    }

    private _renderVirtualList() {
      return (
        <div style={style}>
          <JuiVirtualList
            dataSource={this.state.dataSource}
            rowRenderer={textItemRenderer}
            threshold={threshold}
            overscan={overscan}
            stickToBottom={stickToBottom}
            moreLoader={this._moreLoader}
            onBeforeRowsRendered={this._handleBeforeRowsRendered}
            width={400}
            height={400}
            fixedCellHeight={44}
          />
        </div>
      );
    }

    private _renderLog() {
      const { visibleRange, renderedRange } = this.state;
      const renderRange = (name: string, range: IndexRange) => {
        return (
          <tr>
            <td>{name}</td>
            <td>
              {range.startIndex}-{range.stopIndex}
            </td>
            <td>{range.stopIndex - range.startIndex + 1}</td>
          </tr>
        );
      };
      return (
        <table>
          <thead>
            <tr>
              <td>Type</td>
              <td>Range</td>
              <td>Count</td>
            </tr>
          </thead>
          <tbody>
            {renderRange('visible', visibleRange)}
            {renderRange('rendered', renderedRange)}
            {renderRange('loaded', {
              startIndex: 0,
              stopIndex: this.state.dataSource.size() - 1,
            })}
          </tbody>
        </table>
      );
    }

    render() {
      return (
        <>
          {this._renderVirtualList()}
          {this._renderLog()}
        </>
      );
    }
  }
  return <Content />;
});

storiesOf('Pattern/VirtualList', module).add('Empty VirtualList', () => {
  const dataSource = new DemoStaticDataSource();

  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };

  return (
    <div style={style}>
      <JuiVirtualList
        dataSource={dataSource}
        rowRenderer={textItemRenderer}
        noContentRenderer={noContentRenderer}
        width={400}
        height={400}
      />
    </div>
  );
});

storiesOf('Pattern/VirtualList', module).add('Right Shelf Files', () => {
  const total = Math.max(number('total item count', 1000), 0);

  class RightShelfDataSource extends AbstractDemoInfiniteDataSource<
    number,
    FileItemProps
  > {
    constructor() {
      super();
      // Init 1/10 of the total file items
      const initialCount = Math.floor(total / 10);
      for (let i = 0; i < initialCount; ++i) {
        const item: FileItemProps = {
          name: uuid.v4(),
          subtitle: Math.random().toString(16),
        };
        this.set(i, item);
      }
    }

    loadMore = (startIndex: number, stopIndex: number) => {
      return new Promise((resolve: any) => {
        setTimeout(() => {
          for (let i = startIndex; i < stopIndex; ++i) {
            const item: FileItemProps = {
              name: uuid.v4(),
              subtitle: Math.random().toString(16),
            };
            this.set(i, item);
          }
          resolve();
        },         10);
      });
    }

    hasMore() {
      return total > this.size();
    }
  }

  const dataSource = new RightShelfDataSource();
  const style = {
    width: 400,
    height: 400,
    border: '1px solid',
    display: 'flex',
  };

  const rowRenderer = ({
    index,
    style,
    item,
  }: JuiVirtualCellProps<FileItemProps>) => {
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
  };

  return (
    <div style={style}>
      <JuiVirtualList
        dataSource={dataSource}
        rowRenderer={rowRenderer}
        width={400}
        height={400}
        fixedCellHeight={52}
      />
    </div>
  );
});
