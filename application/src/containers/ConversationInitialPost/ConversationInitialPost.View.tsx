/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:38:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiConversationInitialPost,
  JuiConversationInitialPostHeader,
  JuiConversationInitialPostBody,
} from 'jui/pattern/ConversationInitialPost';
import { JuiButton } from 'jui/components/Buttons';
import { Link } from 'react-router-dom';
import { JuiLink } from 'jui/components/Link';
import { ConversationInitialPostViewProps } from '@/containers/ConversationInitialPost/types';
import image from './img/illustrator.svg';
import { CONVERSATION_TYPES } from '@/constants';

class ConversationInitialPostView extends React.Component<
  ConversationInitialPostViewProps
> {
  constructor(props: ConversationInitialPostViewProps) {
    super(props);
  }

  private get _name() {
    const { creator } = this.props;
    console.log('creator', creator);
    return (
      <JuiLink
        Component={props => <Link to={`/messages/${creator.id}`} {...props} />}
      >
        {creator.displayName}
      </JuiLink>
    );
  }

  private get _conversationInitialPostHeader() {
    return (
      <JuiConversationInitialPostHeader
        name={this._name}
        teamName={this.props.displayName}
        description={this.props.groupDescription}
      />
    );
  }

  private get _handleShareFile() {
    return (
      <JuiButton variant="outlined" color="primary">
        Share a file
      </JuiButton>
    );
  }

  private get _handleCreateTask() {
    return (
      <JuiButton variant="outlined" color="primary">
        Create a task
      </JuiButton>
    );
  }

  private get _handleIntegrateApps() {
    return (
      <JuiButton variant="outlined" color="primary">
        Integrate apps
      </JuiButton>
    );
  }

  private get _conversationInitialPostBody() {
    return (
      <JuiConversationInitialPostBody
        text="Get Started"
        content="Having a home based business is a wonderful asset to your life."
        actions={[
          this._handleShareFile,
          this._handleCreateTask,
          this._handleIntegrateApps,
        ]}
        image={image}
      />
    );
  }

  render() {
    const { groupType } = this.props;
    return (
      <JuiConversationInitialPost>
        {groupType === CONVERSATION_TYPES.TEAM
          ? this._conversationInitialPostHeader
          : null}
        {this._conversationInitialPostBody}
      </JuiConversationInitialPost>
    );
  }
}

export { ConversationInitialPostView };
