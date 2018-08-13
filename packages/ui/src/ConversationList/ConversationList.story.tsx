import * as React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
// import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import { select, number, boolean } from '@storybook/addon-knobs/react';
import backgrounds from '@storybook/addon-backgrounds';
import { action } from '@storybook/addon-actions';
import { People, Star } from '@material-ui/icons';
import { Collapse } from '@material-ui/core';

import List from './ConversationList';
import Item from './ConversationListItem';
import SectionHeader from './ConversationListSectionHeader';

const transition = 'all ease 0.15s';

storiesOf('ConversationList', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#e3e3e3', default: true }]),
)
  .add('List', withInfo(``)(
    () => {
      const width = select(
        'Width',
        {
          '256px': '256px',
          '320px': '320px',
        },
        '320px',
      );

      const expanded = boolean('expanded', true);

      return (
        <div style={{ width, transition }}>
          <SectionHeader
            icon={<Star />}
            title="Favorites"
            unreadCount={32}
            important={true}
            showCount={true}
            expanded={expanded}
          />
          <Collapse in={expanded}>
            <List value={0} onChange={action('change')}>
              <Item status="online" title="Matthew" unreadCount={10} />
              <Item
                showCount={true}
                important={true}
                title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
                unreadCount={12}
              />
              <Item title="Maria" unreadCount={9} />
              <Item title="Jupiter Team" unreadCount={0} />
              <Item status="away" title="Michael" unreadCount={0} />
              <Item status="offline" title="Steve" />
            </List>
          </Collapse>
        </div>
      );
    },
  ))
  .add('Item', withInfo(``)(
    () => {

      const width = select(
        'Width',
        {
          '256px': '256px',
          '320px': '320px',
        },
        '320px',
      );

      const status = select(
        'Status',
        {
          online: 'online',
          offline: 'offline',
          away: 'away',
        },
        'online',
      );

      const important = boolean('Important', false);
      const unreadCount = number('Unread count', 120);
      const isTeam = boolean('is Team', true);

      let title: string;
      if (isTeam) {
        title = 'Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello';
      } else {
        title = 'Eric';
      }

      return (
        <div style={{ width, transition }}>
          <Item
            important={important}
            status={status}
            title={title}
            unreadCount={unreadCount}
            showCount={isTeam}
            onClick={action('click')}
            onMoreClick={action('more')}
          />
        </div>
      );
    },
  ))
  .add('SectionHeader', withInfo(``)(
    () => {
      const width = select(
        'Width',
        {
          '256px': '256px',
          '320px': '320px',
        },
        '320px',
      );

      const important = boolean('Important', false);
      const unreadCount = number('Unread count', 120);
      const showCount = boolean('Show count', true);

      return (
        <div style={{ width, transition }}>
          <SectionHeader
            icon={<People />}
            important={important}
            title="Teams"
            unreadCount={unreadCount}
            showCount={showCount}
            onClick={action('click')}
            onMoreClick={action('more')}
          />
        </div>
      );
    },
  ));
