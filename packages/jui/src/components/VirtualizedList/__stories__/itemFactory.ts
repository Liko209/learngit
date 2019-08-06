/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:28
 * Copyright © RingCentral. All rights reserved.
 */

type DemoItemModel = {
  id: number;
  text: string;
  imageUrl?: string;
  crazy?: boolean;
};

const itemFactory = {
  buildItem(id: number, type: 'text' | 'image' = 'image') {
    let item: DemoItemModel;
    switch (type) {
      default:
      case 'text':
        item = itemFactory.buildTextItem(id);
        break;
      case 'image':
        item = itemFactory.buildImageItem(id, true);
        break;
    }
    return item;
  },

  buildBaseItem(id: number) {
    return {
      id,
      text: `Item-${id}`,
    };
  },

  buildTextItem(id: number) {
    return itemFactory.buildBaseItem(id);
  },

  buildCrazyItem(id: number) {
    return {
      ...itemFactory.buildBaseItem(id),
      crazy: true,
    };
  },

  buildImageItem(id: number, randomSize = false) {
    const height = randomSize ? Math.floor(Math.random() * 10) * 10 : 56;
    return {
      ...itemFactory.buildBaseItem(id),
      imageUrl: `https://via.placeholder.com/500x${height}`,
    };
  },

  buildItems(startId: number, count: number, type: 'text' | 'image' = 'image') {
    const items: DemoItemModel[] = [];
    for (let i = startId; i < startId + count; i++) {
      items.push(itemFactory.buildItem(i, type));
    }
    return items;
  },
};

export { itemFactory, DemoItemModel };
