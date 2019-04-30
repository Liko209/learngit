/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiConversationItemCard as EventUpdateViewCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiLabelWithContent,
  JuiEventLocation,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import {
  JuiEventCollapse,
  JuiEventCollapseContent,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardFooter';
import { getDurationTime } from '../helper';
import { EventUpdateViewProps } from './types';

type Props = WithTranslation & EventUpdateViewProps;
@observer
class EventUpdate extends React.Component<Props> {
  private _getDurationTime = (value: any) => {
    const { event } = this.props;
    const { start, end } = event;
    return getDurationTime(
      !value.start ? start : value.start,
      !value.end ? end : value.end,
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
    const {
      event,
      activityData,
      oldTimeText,
      newTimeText,
      color,
      t,
    } = this.props;
    const { text } = event;
    const { old_values, new_values } = activityData;

    const oldTime = this._getDurationTime(old_values);
    const oldLocation = this._getLocation(old_values);
    const hasOldTime = this._isShowTime(old_values);

    const newTime = this._getDurationTime(new_values);
    const newLocation = this._getLocation(new_values);
    const hasNewTime = this._isShowTime(new_values);

    return (
      <EventUpdateViewCard
        title={text}
        titleColor={color}
        iconColor={color}
        Icon="event"
        Footer={
          (hasOldTime || oldLocation) && (
            <JuiEventCollapse
              showText={t('item.showEventHistory')}
              hideText={t('item.hideEventHistory')}
            >
              {hasOldTime && (
                <JuiEventCollapseContent>{`${oldTime} ${oldTimeText.get()}`}</JuiEventCollapseContent>
              )}
              {oldLocation && (
                <JuiEventCollapseContent>{oldLocation}</JuiEventCollapseContent>
              )}
            </JuiEventCollapse>
          )
        }
      >
        {hasNewTime && (
          <JuiLabelWithContent label={t('item.due')}>
            <JuiTimeMessage time={`${newTime} ${newTimeText.get()}`} />
          </JuiLabelWithContent>
        )}
        {newLocation && (
          <JuiLabelWithContent label={t('item.locationTitle')}>
            <JuiEventLocation location={newLocation} />
          </JuiLabelWithContent>
        )}
      </EventUpdateViewCard>
    );
  }
}

const EventUpdateView = withTranslation('translations')(EventUpdate);

export { EventUpdateView };
