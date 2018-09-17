import React from 'react';
import { InfiniteListDemoViewProps } from './types';

const InfiniteListDemoView = ({ items }: InfiniteListDemoViewProps) => {
  return (
    <ul>
      {items.map(n => (
        <li>{n}</li>
      ))}
    </ul>
  );
};

export { InfiniteListDemoView };
