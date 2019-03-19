/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardPersonFooterViewProps } from './types';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/Profile/MiniCard';
import { JuiIconButton, JuiLinkButton } from 'jui/components/Buttons';
import { goToConversation } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { Call } from '@/modules/telephony';

@observer
class ProfileMiniCardPersonFooter extends Component<
  WithNamespaces & ProfileMiniCardPersonFooterViewProps
> {
  onClickMessage = () => {
    const { id } = this.props;
    const result = goToConversation({ id });
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

const ProfileMiniCardPersonFooterView = translate('translations')(
  ProfileMiniCardPersonFooter,
);

export { ProfileMiniCardPersonFooterView };
