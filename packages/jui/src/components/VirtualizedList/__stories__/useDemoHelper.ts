/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-06 17:48:14
 * Copyright © RingCentral. All rights reserved.
 */
import { useState } from 'react';
import { itemFactory, DemoItemModel } from './itemFactory';

const useItems = (defaultItems: DemoItemModel[] | (() => DemoItemModel[])) => {
  const [items, setItems] = useState(defaultItems);

  const prependItem = (...newItems: DemoItemModel[]) => {
    setItems([...newItems, ...items]);
  };

  const appendItem = (...newItems: DemoItemModel[]) => {
    setItems([...items, ...newItems]);
  };

  const removeItem = (removeIndex: number) => {
    setItems(items.filter((_, index) => removeIndex !== index));
  };

  return { items, appendItem, prependItem, removeItem };
};

const useDemoHelper = ({ initialDataCount }: { initialDataCount: number }) => {
  const { items, appendItem, prependItem, removeItem } = useItems(() => {
    const startId = 1000000;
    return itemFactory.buildItems(startId, initialDataCount, 'image');
  });
  const [visibleRange, setVisibleRange] = useState({
    startIndex: 0,
    stopIndex: 0,
  });
  const [renderedRange, setRenderedRange] = useState({
    startIndex: 0,
    stopIndex: 0,
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

  const appendItems = (count: number) => {
    appendItem(
      ...itemFactory.buildItems(items[items.length - 1].id + 1, count),
    );
  };

  const prependItems = (count: number) => {
    prependItem(...itemFactory.buildItems(items[0].id - count, count));
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
    visibleRange,
    setVisibleRange,
    renderedRange,
    setRenderedRange,
    appendItems,
    prependItems,
  };
};

export { useDemoHelper };
