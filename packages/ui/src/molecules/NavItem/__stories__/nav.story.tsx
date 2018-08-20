import * as React from 'react';
import { boolean, number, select } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { NavItem } from '..';
import { BrowserRouter } from 'react-router-dom';

storiesOf('NavItem', module)
  .add('NavItem', withInfo(``)(
    () => {
      const iconType = select(
        'icon-type',
        {
          Messages: 'Messages',
          Links: 'Links',
          Phone: 'Phone',
          Meetings: 'Meetings',
          Dashboard: 'Dashboard',
          Calendar: 'Calendar',
          Tasks: 'Tasks',
          Files: 'Files',
          Notes: 'Notes',
          Integration: 'Integration',
        },
        'Messages',
      );
      const unreadCount = number('Unread-count', 120);
      const expand = boolean('expand', false);
      const isActive = boolean('isActive', false)
      const activeNum = isActive ? 1 : 0;
      return (
        <BrowserRouter>
          <NavItem
            expand={expand}
            active={activeNum}
            icon={iconType}
            url={iconType}
            title={iconType}
            variant="dot"
            unreadCount={unreadCount}
          />
        </BrowserRouter>
      );
    },
  ));
