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
import { JuiConversationPageInit } from 'jui/pattern/EmptyScreen';
import { JuiButton } from 'jui/components/Buttons';
import { translate } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import { ConversationInitialPostViewProps } from '@/containers/ConversationInitialPost/types';
import image from './img/illustrator.svg';
import { MiniCard } from '../MiniCard';

class ConversationInitialPost extends React.Component<
  ConversationInitialPostViewProps
> {
  constructor(props: ConversationInitialPostViewProps) {
    super(props);
  }

  showProfile = (event: React.MouseEvent) => {
    const { creator } = this.props;
    const target = event.target as HTMLElement;
    event.stopPropagation();
    MiniCard.showProfile({
      id: creator.id,
      anchor: target,
    });
  }

  private get _name() {
    const { creator } = this.props;

    return (
      <JuiLink handleOnClick={this.showProfile}>
        {creator.userDisplayName}
      </JuiLink>
    );
  }

  private get _conversationInitialPostHeader() {
    const {
      isTeam,
      displayName,
      groupDescription,
      t,
      createTime,
      isAllHandsTeam,
    } = this.props;

    const groupCreateInfo = () => {
      if (isTeam) {
        if (isAllHandsTeam) {
          return null;
        }
        return (
          <StyledTitle>
            {this._name}
            <StyledSpan>&nbsp;{t('createATeam')}&nbsp;</StyledSpan>
            <StyledTeamName>{displayName}</StyledTeamName>
            <StyledSpan>
              &nbsp;{t('on')} {createTime}
            </StyledSpan>
          </StyledTitle>
        );
      }
      return (
        <StyledSpan>
          {t('directMessageDescription', { displayName })}
        </StyledSpan>
      );
    };

    const teamDescription = () => {
      if (isTeam) {
        if (groupDescription) {
          return <StyledDescription>{groupDescription}</StyledDescription>;
        }
        if (isAllHandsTeam) {
          return (
            <StyledDescription>
              {t('allHandsTeamDescription')}
            </StyledDescription>
          );
        }
      }
      return null;
    };

    return (
      <JuiConversationInitialPostHeader>
        {groupCreateInfo()}
        {teamDescription()}
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
      <JuiConversationPageInit
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
    const streamIsEmpty = !this.props.notEmpty;
    return (
      <JuiConversationInitialPost>
        {this._conversationInitialPostHeader}
        {streamIsEmpty ? this._conversationInitialPostBody : null}
      </JuiConversationInitialPost>
    );
  }
}

const ConversationInitialPostView = translate('translations')(
  ConversationInitialPost,
);

export { ConversationInitialPostView };
