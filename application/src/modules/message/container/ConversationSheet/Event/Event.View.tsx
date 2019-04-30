/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiLabelWithContent,
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

type Props = WithTranslation & EventViewProps;

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
        <JuiLabelWithContent label={t('item.due')}>
          <JuiTimeMessage time={`${time} ${timeText}`} />
        </JuiLabelWithContent>
        {location && (
          <JuiLabelWithContent label={t('item.locationTitle')}>
            <JuiEventLocation location={location} />
          </JuiLabelWithContent>
        )}
        {description && <JuiEventDescription description={description} />}
      </JuiConversationItemCard>
    );
  }
}

const EventView = withTranslation('translations')(Event);

export { EventView };
