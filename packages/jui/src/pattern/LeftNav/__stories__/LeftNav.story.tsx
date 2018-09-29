/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';
import { BrowserRouter } from 'react-router-dom';
import { JuiLeftNav } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
const UMI_COUNT = [
  [0, 999, 30, 2],
  [2, 10, 88, 0, 0, 1],
];
const icons = [
  [
    { icon: 'dashboard', title: 'Dashboard' },
    { icon: 'message', title: 'Messages' },
    { icon: 'phone', title: 'Phone' },
    { icon: 'videocam', title: 'Meetings' },
  ],
  [
    { icon: 'contacts', title: 'Contacts' },
    { icon: 'date_range', title: 'Calendar' },
    { icon: 'assignment_turned_in', title: 'Tasks' },
    { icon: 'library_books', title: 'Notes' },
    { icon: 'file_copy', title: 'Files' },
    { icon: 'settings', title: 'Settings' },
  ],
];
storiesOf('Pattern/LeftNav', module)
  .addDecorator(withInfoDecorator(JuiLeftNav, { inline: true }))
  .add('JuiLeftNav', () => {
    const isExpand = boolean('expand', false);
    return (
      <BrowserRouter>
        <JuiLeftNav icons={icons} expand={isExpand} unreadCount={UMI_COUNT}/>
      </BrowserRouter>
    );
  });
