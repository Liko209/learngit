/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:46
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPage } from 'jui/pattern/ConversationPage';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { PostListPageViewProps } from './types';
import { Stream } from './Stream';

@observer
class PostListPageView extends Component<PostListPageViewProps> {
  render() {
    const { type, caption, ids } = this.props;

    return (
      <JuiConversationPage
        data-test-automation-id="post-list-page"
        data-type={type}
      >
        <JuiConversationPageHeader
          data-test-automation-id="post-list-page-header"
          title={caption}
        />
        <Stream postIds={ids} />
      </JuiConversationPage>
    );
  }
}

export { PostListPageView };
