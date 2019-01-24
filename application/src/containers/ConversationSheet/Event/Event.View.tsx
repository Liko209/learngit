/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
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
      <JuiConversationItemCard title={text} titleColor={color} Icon="event">
        <JuiTimeMessage time={`${time} ${timeText}`} />
        {location && (
          <JuiEventContent title={t('locationTitle')}>
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
