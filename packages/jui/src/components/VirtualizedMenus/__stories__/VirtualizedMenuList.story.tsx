/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:40:33
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiMenuItem } from '../../Menus/MenuItem';
import { JuiVirtualizedMenu } from '../VirtualizedMenu';
import { JuiVirtualizedMenuList } from '../VirtualizedMenuList';
import { ClickAwayListener } from '@material-ui/core';

storiesOf('Components/VirtualizedMenuList', module).add(
  'VirtualizedMenuList',
  () => {
    const Demo = () => {
      const buttonRef = useRef<HTMLButtonElement | null>(null);
      const [open, setOpen] = useState(false);

      const items = [
        <JuiMenuItem
          key="cut"
          searchString="Cut"
          onClick={() => {
            console.log('Click:Cut');
            setOpen(false);
          }}
        >
          Cut
        </JuiMenuItem>,
        <JuiMenuItem
          key="copy"
          searchString="Copy"
          onClick={() => {
            console.log('Click:Copy');
            setOpen(false);
          }}
        >
          Copy
        </JuiMenuItem>,
        <JuiMenuItem
          key="paste"
          searchString="Paste"
          onClick={() => {
            console.log('Click:Paste');
            setOpen(false);
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
          searchString={`Item-${n}`}
          onClick={() => {
            console.log(`Click:Item-${n}`);
            setOpen(false);
          }}
        >
          Item-{n}
        </JuiMenuItem>
      ));

      items.push(...otherItems);

      return (
        <>
          <button ref={buttonRef} onClick={() => setOpen(true)}>
            Open
          </button>
          <JuiVirtualizedMenu
            open={open}
            anchorEl={buttonRef.current}
            onClose={() => setOpen(false)}
          >
            <JuiVirtualizedMenuList focusOnHover>
              {items}
            </JuiVirtualizedMenuList>
          </JuiVirtualizedMenu>
        </>
      );
    };
    return <Demo />;
  },
);
