/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:54
 * Copyright © RingCentral. All rights reserved.
 */
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
