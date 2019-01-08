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
const UMI_COUNT = [[0, 999, 30, 2], [2, 10, 88, 0, 0, 1]];
const icons = [
  [
    { icon: 'dashboard', title: 'Dashboard', url: '' },
    { icon: 'message', title: 'Messages', url: '' },
    { icon: 'phone', title: 'Phone', url: '' },
    { icon: 'videocam', title: 'Meetings', url: '' },
  ],
  [
    { icon: 'contacts', title: 'Contacts', url: '' },
    { icon: 'date_range', title: 'Calendar', url: '' },
    { icon: 'assignment_turned_in', title: 'Tasks', url: '' },
    { icon: 'library_books', title: 'Notes', url: '' },
    { icon: 'files', title: 'Files', url: '' },
    { icon: 'settings', title: 'Settings', url: '' },
  ],
];
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiLeftNav, { inline: true }))
  .add('LeftNav', () => {
    const isExpand = boolean('expand', false);
    return (
      <BrowserRouter>
        <JuiLeftNav icons={icons} expand={isExpand} onRouteChange={() => {}} />
      </BrowserRouter>
    );
  });
