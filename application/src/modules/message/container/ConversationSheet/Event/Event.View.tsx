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
  JuiSectionDivider,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { EventViewProps } from './types';

type Props = WithTranslation & EventViewProps;

@observer
class Event extends React.Component<Props, {}> {
  render() {
    const { event, t, color, timeContent } = this.props;
    const { location, text, description } = event;

    return (
      <JuiConversationItemCard
        title={text}
        iconColor={color}
        titleColor={color}
        Icon="event"
      >
        <JuiSectionDivider gap={2}>
          <JuiLabelWithContent label={t('item.due')}>
            <JuiTimeMessage time={`${timeContent.get()}`} />
          </JuiLabelWithContent>
          {location && (
            <JuiLabelWithContent label={t('item.locationTitle')}>
              <JuiEventLocation location={location} />
            </JuiLabelWithContent>
          )}
          {description && <JuiEventDescription description={description} />}
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  }
}

const EventView = withTranslation('translations')(Event);

export { EventView };
