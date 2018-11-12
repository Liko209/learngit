/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ConversationPostViewProps, PostType } from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';

const PostTypeMappingComponent = {
  post: ConversationCard,
  notification: Notification,
};

const factory = (type: PostType, postId: number) => {
  const Component = PostTypeMappingComponent[type];
  return <Component id={postId} />;
};

class ConversationPostView extends Component<ConversationPostViewProps> {
  render() {
    const { type, id } = this.props;
    return factory(type, id);
  }
}

export { ConversationPostView };
