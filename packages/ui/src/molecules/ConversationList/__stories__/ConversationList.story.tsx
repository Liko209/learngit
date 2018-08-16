import React from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { select, number, boolean, text } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';

import { Icon } from '../../../atoms';

import {
  ConversationList as List,
  ConversationListItem as ListItem,
  ConversationListSection as Section,
} from '../';

import StoryWrapper from './StoryWrapper';

storiesOf('Molecules/ConversationList', module)
  .add('Section', withInfo({ inline: true })(
    () => (
      <StoryWrapper>
        <Section
          icon={<Icon>star</Icon>}
          title={text('title', 'Favorite')}
          unreadCount={number('unreadCount', 12)}
          important={boolean('important', true)}
          showCount={boolean('showCount', true)}
          expanded={boolean('expanded', true)}
          onExpand={action('expand')}
          onCollapse={action('collapse')}
        >
          <List onChange={action('change')}>
            <ListItem title="Matthew" status="online" unreadCount={10} />
            <ListItem
              title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
              unreadCount={12}
              showCount={false}
              important={true}
            />
            <ListItem title="Maria" unreadCount={9} />
            <ListItem title="Jupiter Team" unreadCount={0} />
            <ListItem title="Michael" status="away" unreadCount={0} />
            <ListItem title="Steve" status="offline" />
          </List>
        </Section>
      </StoryWrapper>
    ),
  ))
  .add('List', withInfo({ inline: true })(
    () => (
      <StoryWrapper>
        <List onChange={action('change')}>
          <ListItem title="Matthew" status="online" unreadCount={10} />
          <ListItem
            title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
            unreadCount={12}
            showCount={false}
            important={true}
          />
          <ListItem title="Maria" unreadCount={9} />
          <ListItem title="Jupiter Team" unreadCount={0} />
          <ListItem title="Michael" status="away" unreadCount={0} />
          <ListItem title="Steve" status="offline" />
        </List>
      </StoryWrapper>
    ),
  ))
  .add('SortableList', withInfo({ inline: true })(
    () => {
      const SortableList = SortableContainer(List);
      const SortableItem = SortableElement(ListItem);

      type SortableDemoStates = {
        items: any[],
      };

      class SortableDemo extends React.Component<{}, SortableDemoStates> {

        constructor(props: {}) {
          super(props);

          this.state = {
            items: [{
              title: 'Matthew',
              status: 'online',
              unreadCount: 10,
            }, {
              title: 'Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello',
              unreadCount: 12,
              showCount: false,
              important: true,
            }, {
              title: 'Maria',
              unreadCount: 9,
            }, {
              title: 'Jupiter Team',
              unreadCount: 0,
            }, {
              title: 'Michael',
              status: 'away',
              unreadCount: 0,
            }, {
              title: 'Steve',
              status: 'offline',
              unreadCount: 0,
            }],
          };
          this._handleSortEnd = this._handleSortEnd.bind(this);
        }

        render() {
          const { items } = this.state;
          return (
            <SortableList onSortEnd={this._handleSortEnd}>
              {items.map((item, i) => <SortableItem key={'item' + i} index={i} {...item} />)}
            </SortableList>
          );
        }

        private _handleSortEnd({ oldIndex, newIndex }: { oldIndex: number; newIndex: number; }) {
          const { items } = this.state;
          this.setState({
            items: arrayMove(items, oldIndex, newIndex),
          });
        }
      }

      return (
        <StoryWrapper>
          <SortableDemo />
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
  ));
