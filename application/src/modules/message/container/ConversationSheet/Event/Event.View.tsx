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
  JuiEventDescription,
  JuiEventLocation,
  JuiTimeMessage,
  JuiSectionDivider,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { EventViewProps } from './types';
import { phoneParserHoc } from '@/modules/common/container/PhoneParser/PhoneParserHoc';
import { Palette } from 'jui/foundation/theme/theme';
type Props = WithTranslation & EventViewProps;

const HocDescription = phoneParserHoc(JuiEventDescription);
@observer
class Event extends React.Component<Props, {}> {
  render() {
    const { event, t, color = ['common', 'black'] as [keyof Palette, string], timeContent } = this.props;
    const { text, description, location } = event;

    return (
      <JuiConversationItemCard
        title={text}
        iconColor={color}
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
          {description && <HocDescription description={description} />}
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  }
}

const EventView = withTranslation('translations')(Event);

export { EventView };
