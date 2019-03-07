/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useState } from 'react';
import { number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';
import { JuiCircularProgress } from '../../Progress';
import { JuiInfiniteList } from '../InfiniteList';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from '../VirtualizedList';
import { IndexRange } from '../VirtualizedListProps';
import { DemoItem } from './DemoItem';
import { itemFactory } from './itemFactory';
import { useDemoHelper } from './useDemoHelper';

const StyledLoadingMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${spacing(15, 0)};
`;

const ListWrapper = styled.div`
  width: 515px;
  margin: 10px 0;
  border: 1px solid #ddd;
`;

const LoadingMore = () => (
  <StyledLoadingMore>
    <JuiCircularProgress />
  </StyledLoadingMore>
);
const DebugTableRow = ({
  name,
  range,
}: {
  name: string;
  range: IndexRange;
}) => {
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

const DebugTable = ({
  visibleRange,
  renderedRange,
  loadedRange,
}: {
  visibleRange: IndexRange;
  renderedRange?: IndexRange;
  loadedRange?: IndexRange;
}) => {
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
        <DebugTableRow name="visible" range={visibleRange} />
        {renderedRange && (
          <DebugTableRow name="rendered" range={renderedRange} />
        )}
        {loadedRange && <DebugTableRow name="loaded" range={loadedRange} />}
      </tbody>
    </table>
  );
};

storiesOf('Components/VirtualizedList', module)
  .add('VirtualizedList', () => {
    const dataCount = number('dataCount', 100);
    const initialScrollToIndex = number('initialScrollToIndex', 0);
    const initialRangeSize = number('initialRangeSize', 7);
    const listHeight = number('listHeight', 400);

    const Demo = () => {
      const ref = useRef<JuiVirtualizedListHandles>(null);
      const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        stopIndex: 0,
      });

      const {
        items,
        handlePrependClick,
        handleAppendClick,
        handleAddCrazyClick,
        handleRemoveClick,
      } = useDemoHelper({ initialDataCount: dataCount });

      const handleDataChange = ({
        currentTarget,
      }: React.FormEvent<HTMLInputElement>) => {
        if (ref.current) {
          const str = currentTarget.value;
          const index = parseInt(str, 10);
          ref.current.scrollToIndex(index);
        }
      };

      const children = items.map(item => (
        <DemoItem key={item.id} item={item} />
      ));
      return (
        <div>
          <button onClick={handlePrependClick}>Prepend Item</button>
          <button onClick={handleAppendClick}>Append Item</button>
          <button onClick={handleAddCrazyClick}>Add Crazy Item</button>
          <button onClick={handleRemoveClick}>Remove Item</button>
          <br />
          <label>
            scrollToIndex:
            <input onInput={handleDataChange} type="number" />
          </label>
          <br />
          <ListWrapper>
            <JuiVirtualizedList
              ref={ref}
              initialScrollToIndex={initialScrollToIndex}
              initialRangeSize={initialRangeSize}
              height={listHeight}
              onVisibleRangeChange={setVisibleRange}
            >
              {children}
            </JuiVirtualizedList>
          </ListWrapper>
          <br />
          <DebugTable visibleRange={visibleRange} />
        </div>
      );
    };
    return <Demo />;
  })
  .add('InfiniteList', () => {
    const initialDataCount = number('initialDataCount', 10);
    const totalDataCount = number('totalDataCount', 1000);
    const initialLoadTime = number('initialLoadTime', 0);
    const moreLoadTime = number('moreLoadTime', 500);

    const InfiniteListDemo = () => {
      const { items, prependItem, appendItem } = useDemoHelper({
        initialDataCount: 0,
      });
      const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        stopIndex: 0,
      });
      const children = items.map(item => (
        <DemoItem key={item.id} item={item} />
      ));

      const startId = 10000;
      const pageSize = 10;

      const hasMore = (direction: 'up' | 'down') =>
        totalDataCount > items.length;

      const sleep = function (time: number) {
        return new Promise((resolve: Function) => {
          setTimeout(() => {
            resolve();
          },         time);
        });
      };

      const loadInitialData = async () => {
        await sleep(initialLoadTime);
        prependItem(
          ...itemFactory.buildItems(
            startId,
            Math.min(initialDataCount, totalDataCount),
          ),
        );
      };

      const loadMore = async (direction: 'up' | 'down') => {
        await sleep(moreLoadTime);
        if (direction === 'up') {
          prependItem(
            ...itemFactory.buildItems(items[0].id - pageSize, pageSize),
          );
        } else {
          appendItem(
            ...itemFactory.buildItems(items[items.length - 1].id + 1, pageSize),
          );
        }
      };

      return (
        <>
          <ListWrapper>
            <JuiInfiniteList
              hasMore={hasMore}
              height={400}
              loadInitialData={loadInitialData}
              loadMore={loadMore}
              loadingMoreRenderer={<LoadingMore />}
              loadingRenderer={<div>loading initial</div>}
              noRowsRenderer={<div>Empty</div>}
              onVisibleRangeChange={setVisibleRange}
            >
              {children}
            </JuiInfiniteList>
          </ListWrapper>
          <br />
          <DebugTable visibleRange={visibleRange} />
        </>
      );
    };
    return <InfiniteListDemo />;
  });
