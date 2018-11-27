/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ConversationPostViewProps, POST_TYPE } from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';
import { MiniCard } from '@/containers/MiniCard';

const PostTypeMappingComponent = {
  [POST_TYPE.POST]: ConversationCard,
  [POST_TYPE.NOTIFICATION]: Notification,
};

class ConversationPostView extends Component<ConversationPostViewProps> {
  constructor(props: ConversationPostViewProps) {
    super(props);
    this.onClickAtMention = this.onClickAtMention.bind(this);
  }

  onClickAtMention(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    const className = target.getAttribute('class') || '';
    const id = Number(target.getAttribute('id'));
    if (className.indexOf('at_mention_compose') > -1 && id > 0) {
      event.stopPropagation();
      MiniCard.showProfile({
        id,
        anchor: target,
      });
    }
  }

  render() {
    const { type, id } = this.props;
    const Component = PostTypeMappingComponent[type];
    return <Component id={id} onClick={this.onClickAtMention} />;
  }
}

export { ConversationPostView };
