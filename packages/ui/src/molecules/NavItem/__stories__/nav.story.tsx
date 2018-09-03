/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-25 15:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { boolean, number, select } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import NavItem from '..';
import { BrowserRouter } from 'react-router-dom';
import { withInfoDecorator } from '../../../utils/decorators';

storiesOf('Molecules/NavItem', module)
  .addDecorator(withInfoDecorator(NavItem))
  .add('NavItem', () => {
    const iconType = select(
      'icon-type',
      {
        Messages: 'Messages',
        Links: 'Links',
        Phone: 'Phone',
        Meetings: 'Meetings',
        Dashboard: 'Dashboard',
        Contacts: 'Contacts',
        Calendar: 'Calendar',
        Tasks: 'Tasks',
        Files: 'Files',
        Notes: 'Notes',
        Integration: 'Integration',
        Settings: 'Settings',
      },
      'Messages',
    );
    const unreadCount = number('Unread-count', 120);
    const expand = boolean('expand', false);
    const isActive = boolean('isActive', false);
    const activeNum = isActive ? 1 : 0;
    return (
      <BrowserRouter>
        <NavItem
          expand={expand}
          active={activeNum}
          icon={iconType}
          url={iconType}
          title={iconType}
          variant="count"
          unreadCount={unreadCount}
        />
      </BrowserRouter>
    );
  });
