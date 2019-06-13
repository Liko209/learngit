/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  SortableContainer,
  SortableElement,
  arrayMove,
  WrappedComponent,
} from 'react-sortable-hoc';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { select, number, boolean, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { JuiUmi } from '../../../components/Umi';
import { JuiPresence, PRESENCE } from '../../../components/Presence';

import {
  JuiConversationList as List,
  JuiConversationListItem as ListItem,
  JuiConversationListSection as Section,
} from '../';

import StoryWrapper from './StoryWrapper';

const moreTooltipTitle = 'More';

storiesOf('Pattern/ConversationList', module)
  .add(
    'Section',
    withInfo({ inline: true })(() => (
      <StoryWrapper>
        <Section
          icon="star"
          title={text('title', 'Favorite')}
          expanded={boolean('expanded', true)}
          umi={
            <JuiUmi
              unreadCount={number('unreadCount', 12)}
              important={boolean('important', true)}
              variant={select(
                'umiVariant',
                {
                  count: 'count',
                  dot: 'dot',
                  auto: 'auto',
                },
                'count',
              )}
            />
          }
          onExpand={action('onExpand')}
          onCollapse={action('onCollapse')}
        >
          <List onChange={action('onChange')}>
            <ListItem
              title="Matthew"
              presence={<JuiPresence presence={PRESENCE.AVAILABLE} />}
              umi={<JuiUmi unreadCount={10} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
            <ListItem
              title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
              presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
              umi={<JuiUmi unreadCount={12} variant="auto" important={true} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
            <ListItem
              title="Maria"
              presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
              umi={<JuiUmi unreadCount={9} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
            <ListItem
              title="Jupiter Team"
              presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
              umi={<JuiUmi unreadCount={0} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
            <ListItem
              title="Michael"
              presence={<JuiPresence presence={PRESENCE.DND} />}
              umi={<JuiUmi unreadCount={0} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
            <ListItem
              title="Steve"
              presence={<JuiPresence presence={PRESENCE.NOTREADY} />}
              indicator={<span />}
              moreTooltipTitle={moreTooltipTitle}
            />
          </List>
        </Section>
      </StoryWrapper>
    )),
  )

  .add(
    'List',
    withInfo({ inline: true })(() => (
      <StoryWrapper>
        <List onChange={action('onChange')}>
          <ListItem
            title="Matthew"
            presence={<JuiPresence presence={PRESENCE.AVAILABLE} />}
            umi={<JuiUmi unreadCount={10} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
          <ListItem
            title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
            presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
            umi={<JuiUmi unreadCount={12} variant="auto" important={true} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
          <ListItem
            title="Maria"
            presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
            umi={<JuiUmi unreadCount={9} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
          <ListItem
            title="Jupiter Team"
            presence={<JuiPresence presence={PRESENCE.UNAVAILABLE} />}
            umi={<JuiUmi unreadCount={0} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
          <ListItem
            title="Michael"
            presence={<JuiPresence presence={PRESENCE.NOTREADY} />}
            umi={<JuiUmi unreadCount={0} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
          <ListItem
            title="Steve"
            presence={<JuiPresence presence={PRESENCE.ONCALL} />}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
        </List>
      </StoryWrapper>
    )),
  )

  .add(
    'SortableList',
    withInfo({ inline: true })(() => {
      /**
       * A demo that shows how to make ConversationList sortable
       * using `react-sortable-hoc` component.
       * More details: https://github.com/clauderic/react-sortable-hoc
       */

      // Make List and ListItem sortable
      const SortableList = SortableContainer(List);
      const SortableItem = SortableElement(ListItem as WrappedComponent<{}>);

      type SortableDemoStates = {
        items: any[];
      };

      class SortableDemo extends React.PureComponent<{}, SortableDemoStates> {
        constructor(props: {}) {
          super(props);

          this.state = {
            items: [
              {
                title: 'Matthew',
                presence: <JuiPresence presence={PRESENCE.AVAILABLE} />,
                umi: <JuiUmi unreadCount={10} />,
              },
              {
                title: 'Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello',
                presence: <JuiPresence presence={PRESENCE.UNAVAILABLE} />,
                umi: (
                  <JuiUmi unreadCount={12} variant="auto" important={true} />
                ),
              },
              {
                title: 'Maria',
                presence: <JuiPresence presence={PRESENCE.UNAVAILABLE} />,
                umi: <JuiUmi unreadCount={9} />,
              },
              {
                title: 'Jupiter Team',
                presence: <JuiPresence presence={PRESENCE.UNAVAILABLE} />,
                umi: <JuiUmi unreadCount={0} />,
              },
              {
                title: 'Michael',
                presence: <JuiPresence presence={PRESENCE.ONCALL} />,
              },
              {
                title: 'Steve',
                presence: <JuiPresence presence={PRESENCE.INMEETING} />,
                umi: <JuiUmi unreadCount={0} />,
              },
            ],
          };
          this._handleSortEnd = this._handleSortEnd.bind(this);
        }

        render() {
          const { items } = this.state;

          // Element become sortable after being dragged a certain
          // number of pixels. So it wouldn't enter dragging mode
          // when user just mean to click the item.
          const distance = 1;

          return (
            <SortableList distance={distance} onSortEnd={this._handleSortEnd}>
              {items.map((item, i) => (
                <SortableItem key={`item${i}`} index={i} {...item} />
              ))}
            </SortableList>
          );
        }

        private _handleSortEnd({
          oldIndex,
          newIndex,
        }: {
          oldIndex: number;
          newIndex: number;
        }) {
          const { items } = this.state;

          // Update items order in state, here you can have some
          // network/db action here to persist the new order.
          this.setState({
            items: arrayMove(items, oldIndex, newIndex),
          });

          action('onSortEnd');
        }
      }

      return (
        <StoryWrapper>
          <SortableDemo />
        </StoryWrapper>
      );
    }),
  )

  .add(
    'ListItem',
    withInfo({ inline: true })(() => {
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
            title={title}
            presence={<JuiPresence presence={PRESENCE.ONCALL} />}
            umi={
              <JuiUmi
                unreadCount={unreadCount}
                important={important}
                variant={isTeam ? 'auto' : 'count'}
              />
            }
            onClick={action('onClick')}
            onMoreClick={action('onMoreClick')}
            indicator={<span />}
            moreTooltipTitle={moreTooltipTitle}
          />
        </StoryWrapper>
      );
    }),
  );
