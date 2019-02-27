import React, { useState, useLayoutEffect } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiVirtualizedList } from '../VirtualizedList';

type ItemModel = {
  id: number;
  text: string;
  imageUrl: string;
  crazy?: boolean;
};

const Item = ({ item }: { item: ItemModel }) => {
  const [crazyHeight, setCrazyHeight] = useState(10);
  useLayoutEffect(() => {
    if (item.crazy) {
      const animationFrame = requestAnimationFrame(() => {
        if (crazyHeight < 100) {
          setCrazyHeight(crazyHeight + 1);
        } else {
          setCrazyHeight(10);
        }
      });
      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
    return () => {};
  },              [crazyHeight]);

  if (item.crazy) {
    return (
      <div style={{ height: crazyHeight, background: '#fdd' }}>I am CRAZY</div>
    );
  }

  return (
    <p style={{ overflow: 'hidden' }}>
      {item.text} <br />
      <img src={item.imageUrl} />
    </p>
  );
};

const useItems = (
  defaultItems: ItemModel[] | (() => ItemModel[]),
): [
  ItemModel[],
  (...newItems: ItemModel[]) => void,
  (...newItems: ItemModel[]) => void,
  (removeIndex: number) => void
] => {
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

  return [items, appendItem, prependItem, removeItem];
};

const Demo = () => {
  const listHeight = 200;

  const [items, , prependItem, removeItem] = useItems(() => {
    const items: ItemModel[] = [];
    for (let i = 100; i < 200; i++) {
      const height = Math.floor(Math.random() * 200);
      items.push({
        id: i,
        text: `Item-${i}`,
        imageUrl: `https://via.placeholder.com/500x${height}`,
      });
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
    console.log(i);
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

  return (
    <div>
      <button onClick={handleAddClick}>Add Item</button>
      <button onClick={handleAddCrazyClick}>Add Crazy Item</button>
      <button onClick={handleRemoveClick}>Remove Item</button>
      <JuiVirtualizedList height={listHeight}>
        {items.map(item => (
          <Item key={item.id} item={item} />
        ))}
      </JuiVirtualizedList>
    </div>
  );
};

storiesOf('Components/VirtualizedList', module).add('VirtualizedList', () => {
  return <Demo />;
});
