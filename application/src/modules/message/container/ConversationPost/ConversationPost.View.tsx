/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ConversationPostViewProps } from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';
import { MiniCard } from '../MiniCard';
import { Profile, PROFILE_TYPE } from '../Profile';
import { POST_TYPE } from '@/common/getPostType';

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
    const getAtMentionNode = (target: HTMLElement): HTMLElement => {
      if (
        target.classList.contains('at_mention_compose') ||
        !target.parentElement
      ) {
        return target;
      }
      return getAtMentionNode(target.parentElement);
    };
    const target = getAtMentionNode(event.target as HTMLElement);
    const className = target.getAttribute('class') || '';
    const id =
      target.getAttribute('id') === '-1'
        ? this.props.conversationId
        : Number(target.getAttribute('id'));
    if (className.indexOf('at_mention_compose') > -1) {
      event.stopPropagation();
      MiniCard.show(<Profile id={id} type={PROFILE_TYPE.MINI_CARD} />, {
        anchor: target as HTMLElement,
      });
    }
  }

  render() {
    const { type, id, cardRef, mode } = this.props;
    const Component = PostTypeMappingComponent[type];
    return (
      <Component
        id={id}
        onClick={this.onClickAtMention}
        cardRef={cardRef}
        mode={mode}
      />
    );
  }
}

export { ConversationPostView };
