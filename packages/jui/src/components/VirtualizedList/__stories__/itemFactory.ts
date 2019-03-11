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
  buildItem(id: number) {
    return {
      id,
      text: `Item-${id}`,
    };
  },

  buildCrazyItem(id: number) {
    return {
      ...itemFactory.buildItem(id),
      crazy: true,
    };
  },

  buildImageItem(id: number, randomSize = false) {
    const height = randomSize ? Math.floor(Math.random() * 10) * 10 : 53;
    return {
      ...itemFactory.buildItem(id),
      imageUrl: `https://via.placeholder.com/500x${height}`,
    };
  },

  buildItems(startId: number, count: number) {
    const items: DemoItemModel[] = [];
    for (let i = startId; i < startId + count; i++) {
      items.push(itemFactory.buildImageItem(i, true));
    }

    return items;
  },
};

export { itemFactory, DemoItemModel };
