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
          messages: 'Messages',
          links: 'Links',
          calls: 'Calls',
          meetings: 'Meetings',
          dashboard: 'Dashboard',
          calendar: 'Calendar',
          tasks: 'Tasks',
          files: 'Files',
          notes: 'Notes',
          integration: 'Integration',
        },
        'messages',
      );
      const unreadCount = number('Unread-count', 120);
      const expand = boolean('expand', false);
      const isActive = boolean('isActive', false)
      return (
        <div>
          <NavItem
            expand={expand}
            url="sdsd"
            active={isActive}
            icon={iconType}
            title={iconType}
            showCount={true}
            unreadCount={unreadCount}
          />
        </div>
      );
    },
  ));
