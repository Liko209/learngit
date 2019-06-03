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
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';
type Props = WithTranslation & EventViewProps;

@observer
class Event extends React.Component<Props, {}> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  render() {
    const { event, t, color, timeContent } = this.props;
    const { text, description, location } = event;

    return (
      <JuiConversationItemCard
        title={postParser(text, { keyword: this.context.keyword })}
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
              <JuiEventLocation>
                {postParser(location, {
                  keyword: this.context.keyword,
                  url: true,
                })}
              </JuiEventLocation>
            </JuiLabelWithContent>
          )}
          {description && (
            <JuiEventDescription>
              {postParser(description, {
                keyword: this.context.keyword,
                phoneNumber: true,
                url: true,
              })}
            </JuiEventDescription>
          )}
        </JuiSectionDivider>
      </JuiConversationItemCard>
    );
  }
}

const EventView = withTranslation('translations')(Event);

export { EventView };
