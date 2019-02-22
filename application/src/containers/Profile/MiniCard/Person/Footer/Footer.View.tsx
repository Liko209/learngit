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
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';
import { goToConversation } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';

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

  render() {
    const { id, t, person } = this.props;
    return (
      <>
        <JuiProfileMiniCardFooterLeft>
          <ProfileButton id={id} />
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
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardPersonFooterView = translate('translations')(
  ProfileMiniCardPersonFooter,
);

export { ProfileMiniCardPersonFooterView };
