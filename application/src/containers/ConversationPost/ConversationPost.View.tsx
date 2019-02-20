/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ConversationPostViewProps, POST_TYPE } from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';
import { MiniCard } from '@/containers/MiniCard';
import { Profile, PROFILE_TYPE } from '@/containers/Profile';

const PostTypeMappingComponent = {
  [POST_TYPE.POST]: ConversationCard,
  [POST_TYPE.NOTIFICATION]: Notification,
};

@observer
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
      MiniCard.show(<Profile id={id} type={PROFILE_TYPE.MINI_CARD} />, {
        anchor: target as HTMLElement,
      });
    }
  }

  render() {
    const { type, id, highlight, onHighlightAnimationStart } = this.props;
    const Component = PostTypeMappingComponent[type];
    return (
      <Component
        id={id}
        onClick={this.onClickAtMention}
        highlight={highlight}
        onHighlightAnimationStart={onHighlightAnimationStart}
      />
    );
  }
}

export { ConversationPostView };
