/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, useLayoutEffect, useRef } from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import { spacing } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';
import { JuiCircularProgress } from '../../Progress';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from '../VirtualizedList';
import { itemFactory, ItemModel } from './itemFactory';
import { JuiInfiniteList } from '../InfiniteList';

const sleep = function (time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      resolve();
    },         time);
  });
};

const StyledLoadingMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${spacing(15, 0)};
`;

const LoadingMore = () => (
  <StyledLoadingMore>
    <JuiCircularProgress />
  </StyledLoadingMore>
);

const Item = ({ item }: { item: ItemModel }) => {
  const [isLiked, setLike] = useState(false);
  const [crazyHeight, setCrazyHeight] = useState(10);
  useLayoutEffect(() => {
    if (item.crazy) {
      const interval = setInterval(() => {
        if (crazyHeight < 100) {
          setCrazyHeight(crazyHeight + 10);
        } else {
          setCrazyHeight(50);
        }
      },                           1000);
      return () => {
        clearInterval(interval);
      };
    }
    return () => {};
  },              [crazyHeight]);

  if (item.crazy) {
    return (
      <div
        style={{
          height: crazyHeight,
          background: '#fdd',
          borderBottom: '1px dashed',
        }}
      >
        I am CRAZY
      </div>
    );
  }

  if (item.imageUrl) {
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px dashed' }}>
        {item.text} <br />
        <img src={item.imageUrl} onClick={() => setLike(!isLiked)} />
        <br />
        <i>{isLiked ? 'you liked it!' : ''}</i>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0', height: 19, borderBottom: '1px dashed' }}>
      <p> {item.text}</p>
    </div>
  );
};

const useItems = (defaultItems: ItemModel[] | (() => ItemModel[])) => {
  const [items, setItems] = useState(defaultItems);

  const prependItem = (...newItems: ItemModel[]) => {
    setItems([...newItems, ...items]);
  };

  const appendItem = (...newItems: ItemModel[]) => {
    setItems([...items, ...newItems]);
  };

  const removeItem = (removeIndex: number) => {
    setItems(items.filter((_, index) => removeIndex !== index));
  };

  return { items, appendItem, prependItem, removeItem };
};

const useDemoHelper = (dataCount: number) => {
  const { items, appendItem, prependItem, removeItem } = useItems(() => {
    const startId = 1000000;
    return itemFactory.buildItems(startId, dataCount);
  });

  const handlePrependClick = () => {
    const i = items[0].id - 1;
    prependItem(itemFactory.buildItem(i));
  };

  const handleAppendClick = () => {
    const i = items[items.length - 1].id + 1;
    appendItem(itemFactory.buildImageItem(i));
  };

  const handleAddCrazyClick = () => {
    const i = items[0].id - 1;
    prependItem(itemFactory.buildCrazyItem(i));
  };

  const handleRemoveClick = () => {
    removeItem(0);
  };

  return {
    items,
    prependItem,
    appendItem,
    removeItem,
    handlePrependClick,
    handleAppendClick,
    handleAddCrazyClick,
    handleRemoveClick,
  };
};

storiesOf('Components/VirtualizedList', module)
  .add('VirtualizedList', () => {
    const dataCount = number('dataCount', 100);
    const initialScrollToIndex = number('initialScrollToIndex', 0);
    const initialRangeSize = number('initialRangeSize', 7);

    const Demo = () => {
      const ref = useRef<JuiVirtualizedListHandles>(null);
      const {
        items,
        handlePrependClick,
        handleAppendClick,
        handleAddCrazyClick,
        handleRemoveClick,
      } = useDemoHelper(dataCount);

      const handleDataChange = ({
        currentTarget,
      }: React.FormEvent<HTMLInputElement>) => {
        if (ref.current) {
          const str = currentTarget.value;
          const index = parseInt(str, 10) || 0;
          ref.current.scrollToIndex(index);
        }
      };

      const children = items.map((item: ItemModel) => (
        <Item key={item.id} item={item} />
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
          <div style={{ border: '1px solid' }}>
            <JuiVirtualizedList
              ref={ref}
              initialScrollToIndex={initialScrollToIndex}
              initialRangeSize={initialRangeSize}
              height={200}
              stickToBottom={true}
            >
              {children}
            </JuiVirtualizedList>
          </div>
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
    const DataLoaderDemo = () => {
      const { items, prependItem, appendItem } = useDemoHelper(0);
      const children = items.map((item: ItemModel) => (
        <Item key={item.id} item={item} />
      ));

      const startId = 10000;
      const pageSize = 10;

      const hasMore = (direction: 'up' | 'down') =>
        totalDataCount > items.length;

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
        <JuiInfiniteList
          hasMore={hasMore}
          height={400}
          loadInitialData={loadInitialData}
          loadMore={loadMore}
          stickToBottom={true}
          loadingMoreRenderer={<LoadingMore />}
          loadingRenderer={<div>loading initial</div>}
          noRowsRenderer={<div>Empty</div>}
        >
          {children}
        </JuiInfiniteList>
      );
    };
    return <DataLoaderDemo />;
  })
  .add('stickToBottom', () => {
    const initialDataCount = 10;
    const totalDataCount = 100;
    const initialLoadTime = 500;
    const moreLoadTime = 500;

    const StickToBottomDemo = () => {
      const ref = useRef(null);

      const [listHeight, setHeight] = useState(200);
      const { items, prependItem, appendItem } = useDemoHelper(0);
      const children = items.map((item: ItemModel) => (
        <Item key={item.id} item={item} />
      ));

      const startId = 10000;
      const pageSize = 10;

      const hasMore = (direction: 'up' | 'down') => {
        if (direction === 'up') {
          return totalDataCount > items.length;
        }
        return false;
      };

      const handleAppendClick = () => {
        const i = items[items.length - 1].id + 1;
        appendItem(itemFactory.buildImageItem(i, true));
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

      const handleHeightChange = ({
        currentTarget,
      }: React.FormEvent<HTMLInputElement>) => {
        if (ref.current) {
          const str = currentTarget.value;
          setHeight(parseInt(str, 10));
        }
      };
      const loadMore = async (direction: 'up' | 'down') => {
        await sleep(moreLoadTime);
        if (direction === 'up') {
          prependItem(
            ...itemFactory.buildItems(items[0].id - pageSize, pageSize),
          );
        }
      };

      return (
        <>
          <label>
            listHeight:
            <input
              ref={ref}
              onInput={handleHeightChange}
              type="number"
              defaultValue={`${listHeight}`}
            />
          </label>
          <button onClick={handleAppendClick}>Append Item</button>
          <JuiInfiniteList
            hasMore={hasMore}
            height={listHeight}
            initialScrollToIndex={initialDataCount - 1}
            loadInitialData={loadInitialData}
            loadMore={loadMore}
            stickToBottom={true}
            loadingMoreRenderer={<LoadingMore />}
            loadingRenderer={<div>loading initial</div>}
            noRowsRenderer={<div>Empty</div>}
          >
            {children}
          </JuiInfiniteList>
        </>
      );
    };
    return <StickToBottomDemo />;
  });
