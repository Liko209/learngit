/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:38:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiConversationInitialPost,
  JuiConversationInitialPostHeader,
  StyledTitle,
  StyledSpan,
  StyledTeamName,
  StyledDescription,
} from 'jui/pattern/ConversationInitialPost';
import { JuiEmptyScreen } from 'jui/pattern/EmptyScreen';
import { JuiButton } from 'jui/components/Buttons';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import { ConversationInitialPostViewProps } from '@/containers/ConversationInitialPost/types';
import image from './img/illustrator.svg';

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
      <JuiConversationInitialPostHeader>
        {isTeam ? (
          <StyledTitle>
            {this._name}
            <StyledSpan>&nbsp;created a team&nbsp;</StyledSpan>
            {<StyledTeamName>{displayName}</StyledTeamName>}
          </StyledTitle>
        ) : (
          <StyledSpan>
            {t('directMessageDescription', { displayName })}
          </StyledSpan>
        )}
        {isTeam && groupDescription ? (
          <StyledDescription>{groupDescription}</StyledDescription>
        ) : null}
      </JuiConversationInitialPostHeader>
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
      <JuiEmptyScreen
        text={t('postInitialTitle')}
        content={t('postInitialContent')}
        actions={[
          this._handleShareFile,
          this._handleCreateTask,
          this._handleIntegrateApps,
        ]}
        image={{ url: image, width: 67, height: 53 }}
      />
    );
  }

  render() {
    const streamIsEmpty = !this.props.notEmpty;
    return (
      <JuiConversationInitialPost>
        {this._conversationInitialPostHeader}
        {streamIsEmpty ? this._conversationInitialPostBody : null}
      </JuiConversationInitialPost>
    );
  }
}

const ConversationInitialPostView = translate('Conversations')(
  ConversationInitialPost,
);

export { ConversationInitialPostView };
