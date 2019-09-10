/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardPersonFooterViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/Profile/MiniCard';
import { JuiIconButton, JuiButton } from 'jui/components/Buttons';
import { goToConversationWithLoading } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';
import { MiniCard } from '@/modules/message/container/MiniCard';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { IMessageStore } from '@/modules/message/interface';
import { ProfileDialogPerson } from '@/modules/message/container/Profile/Dialog/Person';
import { analyticsCollector } from '@/AnalyticsCollector';

@observer
class ProfileMiniCardPersonFooter extends Component<
  WithTranslation & ProfileMiniCardPersonFooterViewProps
> {
  @IMessageStore private _messageStore: IMessageStore;

  onClickMessage = () => {
    analyticsCollector.goToConversation('miniProfile', '1:1 conversation');
    const { id } = this.props;
    const result = goToConversationWithLoading({ id });
    if (result) {
      this.handleCloseMiniCard();
    }
  };

  getAriaLabelKey = () => {
    const { isMe } = this.props;
    return isMe ? 'people.profile.ariaGoToMe' : 'people.profile.ariaGoToOther';
  };

  handleCloseMiniCard = () => {
    delete MiniCard.dismiss;
    portalManager.dismissLast();
    portalManager.addShouldCloseStatus();
  };

  private get _ActionButtons() {
    const { id, t, person } = this.props;
    const IconButton = (
      <JuiIconButton
        key="go to conversation"
        size="medium"
        color="primary"
        variant="plain"
        tooltipTitle={t('message.Messages')}
        onClick={this.onClickMessage}
        ariaLabel={t(this.getAriaLabelKey(), {
          name: person.userDisplayName,
        })}
      >
        chat
      </JuiIconButton>
    );

    const { conversationHeaderExtensions } = this._messageStore;
    const actionButtons = conversationHeaderExtensions.map(
      (Comp: ComponentType<any>) => (
        <Comp
          key={`MESSAGE_PROFILE_FOOTER_EXTENSION_${Comp.displayName}`}
          color="primary"
          variant="plain"
          id={id}
          analysisSource="mini-profile"
        />
      ),
    );

    actionButtons.unshift(IconButton);

    return actionButtons;
  }

  render() {
    const { id, t } = this.props;
    return (
      <>
        <JuiProfileMiniCardFooterLeft>
          <OpenProfileDialog
            id={id}
            profileDialog={ProfileDialogPerson}
            beforeClick={this.handleCloseMiniCard}
            dataTrackingProps={{
              category: 'Person',
              source: 'miniProfile',
            }}
          >
            <JuiButton size="medium" variant={'text'}>
              {t('people.team.profile')}
            </JuiButton>
          </OpenProfileDialog>
        </JuiProfileMiniCardFooterLeft>
        <JuiProfileMiniCardFooterRight>
          {this._ActionButtons}
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardPersonFooterView = withTranslation('translations')(
  ProfileMiniCardPersonFooter,
);

export { ProfileMiniCardPersonFooterView };
