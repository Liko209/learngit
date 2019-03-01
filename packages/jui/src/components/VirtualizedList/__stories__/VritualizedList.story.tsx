/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, useLayoutEffect, useRef } from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from '../VirtualizedList';
import { itemFactory } from './itemFactory';

type ItemModel = {
  id: number;
  text: string;
  imageUrl?: string;
  crazy?: boolean;
};

const Item = ({ item }: { item: ItemModel }) => {
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
        <img src={item.imageUrl} />
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0', height: 20, borderBottom: '1px dashed' }}>
      {item.text}
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

storiesOf('Components/VirtualizedList', module).add('VirtualizedList', () => {
  const dataCount = number('dataCount', 100);
  const initialScrollToIndex = number('initialScrollToIndex', 0);
  const initialRangeSize = number('initialRangeSize', 7);
  const listHeight = number('listHeight', 200);

  const Demo = () => {
    const ref = useRef<JuiVirtualizedListHandles>(null);

    const { items, appendItem, prependItem, removeItem } = useItems(() => {
      const items: ItemModel[] = [];
      const startId = 100;
      for (let i = startId; i < startId + dataCount; i++) {
        items.push(itemFactory.buildImageItem(i, true));
      }
      return items;
    });

    const handlePrependClick = () => {
      const i = items[0].id - 1;
      prependItem({
        id: i,
        text: `Item-${i}`,
        imageUrl: 'https://via.placeholder.com/200x150',
      });
    };

    const handleAppendClick = () => {
      const i = items[items.length - 1].id + 1;
      appendItem({
        id: i,
        text: `Item-${i}`,
        imageUrl: 'https://via.placeholder.com/200x150',
      });
    };

    const handleAddCrazyClick = () => {
      const i = items[0].id - 1;
      prependItem({
        crazy: true,
        id: i,
        text: `Item-${i}`,
        imageUrl: 'https://via.placeholder.com/200x150',
      });
    };

    const handleRemoveClick = () => {
      removeItem(0);
    };

    const scrollToIndex = (event: React.FormEvent<HTMLInputElement>) => {
      if (ref.current) {
        const str = event.currentTarget.value;
        const index = parseInt(str, 10);
        ref.current.scrollToIndex(index);
      }
    };

    const children = items.map(item => <Item key={item.id} item={item} />);
    return (
      <div>
        <button onClick={handlePrependClick}>Prepend Item</button>
        <button onClick={handleAppendClick}>Append Item</button>
        <button onClick={handleAddCrazyClick}>Add Crazy Item</button>
        <button onClick={handleRemoveClick}>Remove Item</button>
        <br />
        <label>
          scrollToIndex:
          <input onInput={scrollToIndex} type="number" />
        </label>
        <br />
        <div style={{ border: '1px solid' }}>
          <JuiVirtualizedList
            ref={ref}
            initialScrollToIndex={initialScrollToIndex}
            initialRangeSize={initialRangeSize}
            height={listHeight}
          >
            {children}
          </JuiVirtualizedList>
        </div>
      </div>
    );
  };
  return <Demo />;
});
