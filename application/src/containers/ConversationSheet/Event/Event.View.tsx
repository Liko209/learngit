/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiEventContent,
  JuiEventLocation,
  JuiEventDescription,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  getDurationTime,
  getDurationTimeText,
  getDurationDate,
} from '../helper';
import { EventViewProps } from './types';

type Props = WithNamespaces & EventViewProps;

@observer
class Event extends React.Component<Props, {}> {
  render() {
    const { event, t, color } = this.props;
    const {
      location,
      text,
      description,
      start,
      end,
      repeat,
      allDay,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = event;
    const time = allDay
      ? getDurationDate(start, end)
      : getDurationTime(start, end);
    const timeText = getDurationTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );
    return (
      <JuiConversationItemCard
        title={text}
        iconColor={color}
        titleColor={color}
        Icon="event"
      >
        <JuiEventContent title={t('item.due')}>
          <JuiTimeMessage time={`${time} ${timeText}`} />
        </JuiEventContent>
        {location && (
          <JuiEventContent title={t('item.locationTitle')}>
            <JuiEventLocation location={location} />
          </JuiEventContent>
        )}
        {description && <JuiEventDescription description={description} />}
      </JuiConversationItemCard>
    );
  }
}

const EventView = translate('translations')(Event);

export { EventView };
