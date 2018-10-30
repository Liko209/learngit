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
import { translate } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import { ConversationInitialPostViewProps } from '@/containers/ConversationInitialPost/types';
import image from './img/illustrator.svg';
// import { CONVERSATION_TYPES } from '@/constants';

class ConversationInitialPost extends React.Component<
  ConversationInitialPostViewProps
> {
  constructor(props: ConversationInitialPostViewProps) {
    super(props);
  }

  private get _name() {
    const { creator, creatorGroupId } = this.props;
    return (
      <JuiLink
        Component={props => (
          <Link to={`/messages/${creatorGroupId}`} {...props} />
        )}
      >
        {creator.displayName}
      </JuiLink>
    );
  }

  private get _conversationInitialPostHeader() {
    const { isTeam, displayName, groupDescription, t } = this.props;

    return (
      <JuiConversationInitialPostHeader
        name={this._name}
        teamName={displayName}
        description={groupDescription}
        isTeam={isTeam}
        directMessageDescription={t('directMessageDescription', {
          displayName,
        })}
      />
    );
  }

  private get _handleShareFile() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('shareFile')}
      </JuiButton>
    );
  }

  private get _handleCreateTask() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('createTask')}
      </JuiButton>
    );
  }

  private get _handleIntegrateApps() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('integrateApps')}
      </JuiButton>
    );
  }

  private get _conversationInitialPostBody() {
    const { t } = this.props;

    return (
      <JuiConversationInitialPostBody
        text={t('postInitialTitle')}
        content={t('postInitialContent')}
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
    return (
      <JuiConversationInitialPost>
        {/* {groupType === CONVERSATION_TYPES.TEAM
          ? this._conversationInitialPostHeader
          : null} */}
        {this._conversationInitialPostHeader}
        {this._conversationInitialPostBody}
      </JuiConversationInitialPost>
    );
  }
}

const ConversationInitialPostView = translate('Conversations')(
  ConversationInitialPost,
);

export { ConversationInitialPostView };
