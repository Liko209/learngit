/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:26
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, useLayoutEffect } from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import { JuiVirtualizedList } from '../VirtualizedList';
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
      <div style={{ height: crazyHeight, background: '#fdd' }}>I am CRAZY</div>
    );
  }

  if (item.imageUrl) {
    return (
      <div style={{ padding: '10px 0' }}>
        {item.text} <br />
        <img src={item.imageUrl} />
      </div>
    );
  }

  return <div style={{ padding: '10px 0', height: 20 }}>{item.text}</div>;
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
  const initialScrollToIndex = number('initialScrollToIndex', 11);
  const initialRangeSize = number('initialRangeSize', 11);
  const listHeight = number('listHeight', 200);

  const Demo = () => {
    const { items, prependItem, removeItem } = useItems(() => {
      const items: ItemModel[] = [];
      items.push(itemFactory.buildItem(0));
      for (let i = 1; i < dataCount; i++) {
        items.push(itemFactory.buildItem(i));
      }
      return items;
    });

    const handleAddClick = () => {
      const i = items[0].id - 1;
      prependItem({
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
    const children = items.map(item => <Item key={item.id} item={item} />);
    return (
      <div>
        <button onClick={handleAddClick}>Add Item</button>
        <button onClick={handleAddCrazyClick}>Add Crazy Item</button>
        <button onClick={handleRemoveClick}>Remove Item</button>
        <JuiVirtualizedList
          initialScrollToIndex={initialScrollToIndex}
          initialRangeSize={initialRangeSize}
          height={listHeight}
        >
          {children}
        </JuiVirtualizedList>
      </div>
    );
  };
  return <Demo />;
});
