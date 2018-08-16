import React from 'react';

import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { select, number, boolean } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';

import Collapse from '@material-ui/core/Collapse';
import { Icon } from '../../../atoms';

import {
  ConversationList as List,
  ConversationListItem as ListItem,
  ConversationListSectionHeader as SectionHeader,
} from '../';

import StoryWrapper from './StoryWrapper';

storiesOf('Molecules/ConversationList', module)
  .add('List', withInfo({ inline: true })(
    () => {
      const expanded = boolean('expanded', true);

      return (
        <StoryWrapper>
          <SectionHeader
            icon={<Icon>star</Icon>}
            title="Favorites"
            unreadCount={32}
            important={true}
            showCount={true}
            expanded={expanded}
          />
          <Collapse in={expanded}>
            <List value={0} onChange={action('change')}>
              <ListItem status="online" title="Matthew" unreadCount={10} />
              <ListItem
                showCount={true}
                important={true}
                title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
                unreadCount={12}
              />
              <ListItem title="Maria" unreadCount={9} />
              <ListItem title="Jupiter Team" unreadCount={0} />
              <ListItem status="away" title="Michael" unreadCount={0} />
              <ListItem status="offline" title="Steve" />
            </List>
          </Collapse>
        </StoryWrapper>
      );
    },
  ))
  .add('ListItem', withInfo({ inline: true })(
    () => {

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
        <StoryWrapper>
          <ListItem
            important={important}
            status={status}
            title={title}
            unreadCount={unreadCount}
            showCount={!isTeam}
            onClick={action('click')}
            onMoreClick={action('more')}
          />
        </StoryWrapper>
      );
    },
  ))
  .add('SectionHeader', withInfo({ inline: true })(
    () => {
      const important = boolean('Important', false);
      const unreadCount = number('Unread count', 120);
      const showCount = boolean('Show count', true);

      return (
        <StoryWrapper>
          <SectionHeader
            icon={<Icon>people</Icon>}
            important={important}
            title="Teams"
            unreadCount={unreadCount}
            showCount={showCount}
            onClick={action('click')}
            onArrowClick={action('arrow')}
          />
        </StoryWrapper>
      );
    },
  ));
