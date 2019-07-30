/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:40:33
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { usePopupHelper } from '../../../foundation/hooks/usePopupHelper';
import { JuiMenuItem } from '../../Menus/MenuItem';
import { JuiPaper } from '../../Paper/Paper';
import { JuiVirtualizedMenu } from '../VirtualizedMenu';
import { JuiVirtualizedMenuList } from '../VirtualizedMenuList';

const useDemoState = () => {
  const popupHelper = usePopupHelper({ variant: 'popover' });
  const items = [
    <JuiMenuItem
      key="cut"
      searchString="Cut"
      onClick={() => {
        console.log('Click:Cut');
        popupHelper.close();
      }}
    >
      Cut
    </JuiMenuItem>,
    <JuiMenuItem
      key="copy"
      searchString="Copy"
      onClick={() => {
        console.log('Click:Copy');
        popupHelper.close();
      }}
    >
      Copy
    </JuiMenuItem>,
    <JuiMenuItem
      key="paste"
      searchString="Paste"
      onClick={() => {
        console.log('Click:Paste');
        popupHelper.close();
      }}
    >
      Paste
    </JuiMenuItem>,
    <JuiMenuItem key="translate" searchString="Translate" disabled>
      Translate
    </JuiMenuItem>,
  ];

  const otherItems = _.range(0, 1000).map(n => (
    <JuiMenuItem
      key={`item_${n}`}
      searchString={`${n}-Item`}
      onClick={() => {
        console.log(`Click:Item-${n}`);
        popupHelper.close();
      }}
    >
      {n}-Item
    </JuiMenuItem>
  ));

  items.push(...otherItems);
  return { popupHelper, items };
};

storiesOf('Components/VirtualizedMenus', module)
  .add('VirtualizedMenu', () => {
    const focusOnHover = boolean('focusOnHover', true);
    const loop = boolean('loop', false);

    const Demo = () => {
      const buttonRef = useRef<HTMLButtonElement | null>(null);
      const { popupHelper, items } = useDemoState();
      return (
        <>
          <button ref={buttonRef} {...popupHelper.TriggerProps}>
            Open Menu
          </button>
          <JuiVirtualizedMenu
            focusOnHover={focusOnHover}
            loop={loop}
            {...popupHelper.MenuProps}
          >
            {items}
          </JuiVirtualizedMenu>
        </>
      );
    };
    return <Demo />;
  })
  .add('VirtualizedMenuList', () => {
    const focusOnHover = boolean('focusOnHover', false);
    const loop = boolean('loop', true);

    const Demo = () => {
      const { items } = useDemoState();
      return (
        <JuiPaper style={{ height: 200 }}>
          <JuiVirtualizedMenuList focusOnHover={focusOnHover} loop={loop}>
            {items}
          </JuiVirtualizedMenuList>
        </JuiPaper>
      );
    };
    return <Demo />;
  });
