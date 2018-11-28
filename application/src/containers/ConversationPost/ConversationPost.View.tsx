/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  ConversationPostViewProps,
  POST_TYPE,
  ConversationPostProps,
} from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';

const PostTypeMappingComponent = {
  [POST_TYPE.POST]: ConversationCard,
  [POST_TYPE.NOTIFICATION]: Notification,
};

const factory = (
  type: POST_TYPE,
  postId: number,
  highlight: boolean,
  onHighlightAnimationStart?: React.AnimationEventHandler,
) => {
  const Component: React.ComponentType<ConversationPostProps> =
    PostTypeMappingComponent[type];
  return (
    <Component
      id={postId}
      highlight={highlight}
      onHighlightAnimationStart={onHighlightAnimationStart}
    />
  );
};

class ConversationPostView extends Component<ConversationPostViewProps> {
  render() {
    const { type, id, highlight, onHighlightAnimationStart } = this.props;
    return factory(type, id, highlight, onHighlightAnimationStart);
  }
}

export { ConversationPostView };
