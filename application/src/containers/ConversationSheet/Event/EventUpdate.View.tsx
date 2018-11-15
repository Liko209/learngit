/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { JuiConversationItemCard as EventUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiEventLocation,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiEventCollapse,
  JuiEventCollapseContent,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
import { getDurationTime, getDurationTimeText } from '../helper';
import { EventUpdateViewProps } from './types';

class EventUpdateView extends React.Component<EventUpdateViewProps> {
  private _getDurationTime = (value: any) => {
    const { event } = this.props;
    const { start, end } = event;
    return getDurationTime(
      !value.start ? start : value.start,
      !value.end ? end : value.end,
    );
  }

  private _getTimeText = (value: any) => {
    const { event } = this.props;
    const { repeat, repeatEndingAfter, repeatEnding, repeatEndingOn } = event;
    return (
      repeatEndingAfter &&
      getDurationTimeText(
        value.repeat || repeat,
        value.repeat_ending_after || repeatEndingAfter,
        value.repeat_ending_on || repeatEndingOn,
        value.repeat_ending || repeatEnding,
      )
    );
  }

  private _isShowTime = (value: any) => {
    return (
      value.start ||
      value.end ||
      value.repeat ||
      value.repeat_ending_after ||
      value.repeat_ending_on ||
      value.repeat_ending
    );
  }

  private _getLocation = (value: any) => value.location;

  render() {
    const { event, post } = this.props;
    const { color, text } = event;
    const { old_values, new_values } = post.activityData;

    const oldTime = this._getDurationTime(old_values);
    const oldTimeText = this._getTimeText(old_values);
    const oldLocation = this._getLocation(old_values);
    const hasOldTime = this._isShowTime(old_values);

    const newTime = this._getDurationTime(new_values);
    const newTimeText = this._getTimeText(new_values);
    const newLocation = this._getLocation(new_values);
    const hasNewTime = this._isShowTime(new_values);

    return (
      <EventUpdateViewCard
        title={text}
        titleColor={color}
        Icon="event"
        Footer={
          (hasOldTime || oldLocation) && (
            <JuiEventCollapse
              showText={t('showEventHistory')}
              hideText={t('hideEventHistory')}
            >
              {hasOldTime && (
                <JuiEventCollapseContent>{`${oldTime} ${oldTimeText}`}</JuiEventCollapseContent>
              )}
              {oldLocation && (
                <JuiEventCollapseContent>{oldLocation}</JuiEventCollapseContent>
              )}
            </JuiEventCollapse>
          )
        }
      >
        {hasNewTime && <JuiTimeMessage time={`${newTime} ${newTimeText}`} />}
        {newLocation && <JuiEventLocation location={newLocation} />}
      </EventUpdateViewCard>
    );
  }
}

export { EventUpdateView };
