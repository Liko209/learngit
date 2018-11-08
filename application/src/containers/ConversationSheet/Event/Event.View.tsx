/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 15:37:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { EventViewProps } from './types';

class EventView extends React.Component<EventViewProps, {}> {
  render() {
    const { event } = this.props;
    console.log(event, '----event');
    return (
      <JuiConversationItemCard title="title" icon="get_app">
        sdfsdf
      </JuiConversationItemCard>
    );
  }
}

export { EventView };
