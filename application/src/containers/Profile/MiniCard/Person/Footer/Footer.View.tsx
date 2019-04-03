/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardPersonFooterViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/Profile/MiniCard';
import { JuiIconButton, JuiLinkButton } from 'jui/components/Buttons';
import { goToConversationWithLoading } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { Call } from '@/modules/telephony';

@observer
class ProfileMiniCardPersonFooter extends Component<
  WithTranslation & ProfileMiniCardPersonFooterViewProps
> {
  onClickMessage = () => {
    const { id } = this.props;
    const result = goToConversationWithLoading({ id });
    if (result) {
      portalManager.dismissLast();
    }
  }

  getAriaLabelKey = () => {
    const { isMe } = this.props;
    return isMe ? 'people.profile.ariaGoToMe' : 'people.profile.ariaGoToOther';
  }

  handleCloseMiniCard = () => {
    portalManager.dismissLast();
  }

  render() {
    const { id, t, person } = this.props;
    return (
      <>
        <JuiProfileMiniCardFooterLeft>
          <OpenProfileDialog id={id} beforeClick={this.handleCloseMiniCard}>
            <JuiLinkButton>{t('people.team.profile')}</JuiLinkButton>
          </OpenProfileDialog>
        </JuiProfileMiniCardFooterLeft>
        <JuiProfileMiniCardFooterRight>
          <JuiIconButton
            size="medium"
            color="primary"
            variant="plain"
            tooltipTitle={t('message.Messages')}
            onClick={this.onClickMessage}
            ariaLabel={t(this.getAriaLabelKey(), {
              name: person.userDisplayName,
            })}
          >
            chat_bubble
          </JuiIconButton>
          <Call color="primary" variant="plain" id={id} />
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardPersonFooterView = withTranslation('translations')(
  ProfileMiniCardPersonFooter,
);

export { ProfileMiniCardPersonFooterView };
