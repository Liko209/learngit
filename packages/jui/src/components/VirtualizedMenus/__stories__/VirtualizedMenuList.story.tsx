/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:40:33
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiMenuItem } from '../../Menus/MenuItem';
import { JuiVirtualizedMenu } from '../VirtualizedMenu';
import { JuiVirtualizedMenuList } from '../VirtualizedMenuList';

storiesOf('Components/VirtualizedMenuList', module).add(
  'VirtualizedMenuList',
  () => {
    const items = [
      <JuiMenuItem
        key="cut"
        searchString="Cut"
        onClick={() => {
          console.log('Cut');
        }}
      >
        Cut
      </JuiMenuItem>,
      <JuiMenuItem
        key="copy"
        searchString="Copy"
        onClick={() => {
          console.log('Copy');
        }}
      >
        Copy
      </JuiMenuItem>,
      <JuiMenuItem
        key="paste"
        searchString="Paste"
        onClick={() => {
          console.log('Paste');
        }}
      >
        Paste
      </JuiMenuItem>,
      <JuiMenuItem
        key="translate"
        searchString="Translate"
        onClick={() => {
          console.log('Translate');
        }}
        disabled
      >
        Translate
      </JuiMenuItem>,
    ];

    const otherItems = _.range(0, 1000).map(n => (
      <JuiMenuItem key={`item_${n}`} searchString={`Item-${n}`}>
        Item-{n}
      </JuiMenuItem>
    ));

    items.push(...otherItems);

    return (
      <JuiVirtualizedMenu open>
        <JuiVirtualizedMenuList focusOnHover>{items}</JuiVirtualizedMenuList>
      </JuiVirtualizedMenu>
    );
  },
);
