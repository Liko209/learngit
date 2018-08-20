import * as React from 'react';
import { boolean, number, select} from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { NavItem } from '.';

storiesOf('NavItem', module)
  .add('NavItem', withInfo(``)(
    () => {
      const iconType = select(
        'icon-type',
        {
          Messages: 'Messages',
          Links: 'Links',
          Calls: 'Phone',
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
        <div>
          <NavItem
            expand={expand}
            active={activeNum}
            icon={iconType}
            title={iconType}
            showCount={true}
            unreadCount={unreadCount}
          />
        </div>
      );
    },
  ));
