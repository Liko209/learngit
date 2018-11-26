/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ConversationPostViewProps, POST_TYPE } from './types';
import { ConversationCard } from '../ConversationCard';
import { Notification } from './Notification';

const PostTypeMappingComponent = {
  [POST_TYPE.POST]: ConversationCard,
  [POST_TYPE.NOTIFICATION]: Notification,
};

const factory = (type: POST_TYPE, postId: number, highlight: boolean) => {
  const Component: any = PostTypeMappingComponent[type];
  return <Component id={postId} highlight={highlight} />;
};

class ConversationPostView extends Component<ConversationPostViewProps> {
  render() {
    const { type, id, highlight } = this.props;
    return factory(type, id, highlight);
  }
}

export { ConversationPostView };
