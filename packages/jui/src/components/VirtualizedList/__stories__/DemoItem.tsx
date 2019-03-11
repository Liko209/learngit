/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-06 17:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, useState, useLayoutEffect } from 'react';
import { DemoItemModel } from './itemFactory';

const ItemFooter = () => {
  const [liked, setLiked] = useState(false);
  return (
    <div>
      <button onClick={() => setLiked(!liked)}>Toggle Like</button>
      {liked && <div>I like this post</div>}
    </div>
  );
};

const DemoItem = ({ item }: { item: DemoItemModel }) => {
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
      <div style={{ padding: '10px 0', borderBottom: '1px dashed #ddd' }}>
        {item.text} <br />
        <img src={item.imageUrl} />
        <ItemFooter />
      </div>
    );
  }

  return (
    <div
      style={{ padding: '10px 0', height: 19, borderBottom: '1px dashed #ddd' }}
    >
      {item.text}
      <ItemFooter />
    </div>
  );
};

const MemoDemoItem = memo(DemoItem);

export { MemoDemoItem as DemoItem };
