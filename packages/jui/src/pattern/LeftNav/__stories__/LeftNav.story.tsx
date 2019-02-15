/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { BrowserRouter } from 'react-router-dom';
import { JuiLeftNav } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
const icons = [
  [
    { icon: 'dashboard', title: 'Dashboard', url: 'path/1' },
    { icon: 'messages', title: 'Messages', url: 'path/1' },
    { icon: 'phone', title: 'Phone', url: 'path/1' },
    { icon: 'meetings', title: 'Meetings', url: 'path/1' },
  ],
  [
    { icon: 'contacts', title: 'Contacts', url: 'path/1' },
    { icon: 'calendar', title: 'Calendar', url: 'path/1' },
    { icon: 'tasks', title: 'Tasks', url: 'path/1' },
    { icon: 'notes', title: 'Notes', url: 'path/1' },
    { icon: 'copy', title: 'Files', url: 'path/1' },
    { icon: 'settings', title: 'Settings', url: 'path/1' },
  ],
];
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiLeftNav, { inline: true }))
  .add('LeftNav', () => {
    const isExpand = boolean('expand', false);
    return (
      <BrowserRouter>
        <JuiLeftNav
          selectedPath={'a'}
          icons={icons}
          expand={isExpand}
          onRouteChange={() => {}}
        />
      </BrowserRouter>
    );
  });
