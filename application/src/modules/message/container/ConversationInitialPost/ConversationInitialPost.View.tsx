/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-27 17:38:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiConversationInitialPostHeader,
  StyledTitle,
  StyledSpan,
  StyledTeamName,
  StyledDescription,
} from 'jui/pattern/ConversationInitialPost';
import { JuiConversationPageInit } from 'jui/pattern/EmptyScreen';
import { JuiButton } from 'jui/components/Buttons';
import { withTranslation, Trans } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import { ConversationInitialPostViewProps } from './types';
import image from './img/illustrator.svg';
import { MiniCard } from '../MiniCard';
import { Profile, PROFILE_TYPE } from '../Profile';
import { observer } from 'mobx-react';

@observer
class ConversationInitialPost extends React.Component<
  ConversationInitialPostViewProps
> {
  showProfile = (event: React.MouseEvent) => {
    const { creator } = this.props;
    const target = event.target as HTMLElement;
    event.stopPropagation();
    MiniCard.show(<Profile id={creator.id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: target as HTMLElement,
    });
  };

  private get _conversationInitialPostHeader() {
    return (
      <JuiConversationInitialPostHeader>
        {this._groupCreateInfo()}
        {this._teamDescription()}
      </JuiConversationInitialPostHeader>
    );
  }

  private _groupCreateInfo() {
    const { isTeam, displayName, t, createTime, isCompanyTeam, creator } = this.props;
    if (!isTeam) {
      return (
        <StyledSpan>
          {t('message.initialPost.directMessageDescription', { displayName })}
        </StyledSpan>
      );
    }

    if (!isCompanyTeam) {
      return (
        <StyledTitle>
          <Trans
            i18nKey="message.initialPost.createTeamInfo"
            components={[
              <JuiLink handleOnClick={this.showProfile} key="link" />,
              <StyledSpan key="span" />,
              <StyledTeamName key="name" />,
            ]}
            values={{displayName, userName: creator.userDisplayName, createTime: createTime.get()}}
          />
        </StyledTitle>
      );
    }

    return null;
  }

  private _teamDescription() {
    const { isTeam, groupDescription } = this.props;
    if (!isTeam) return null;
    if (groupDescription) {
      return <StyledDescription>{groupDescription}</StyledDescription>;
    }
    return null;
  }

  private get _handleShareFile() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('message.initialPost.shareFile')}
      </JuiButton>
    );
  }

  private get _handleCreateTask() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('message.initialPost.createTask')}
      </JuiButton>
    );
  }

  private get _handleIntegrateApps() {
    const { t } = this.props;
    return (
      <JuiButton variant="outlined" color="primary">
        {t('message.initialPost.integrateApps')}
      </JuiButton>
    );
  }

  private get _conversationInitialPostBody() {
    const { t } = this.props;

    return (
      <JuiConversationPageInit
        text={t('message.initialPost.postInitialTitle')}
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
      <>
        {this._conversationInitialPostHeader}
        {streamIsEmpty ? this._conversationInitialPostBody : null}
      </>
    );
  }
}

const ConversationInitialPostView = withTranslation('translations')(
  ConversationInitialPost,
);

export { ConversationInitialPostView };
