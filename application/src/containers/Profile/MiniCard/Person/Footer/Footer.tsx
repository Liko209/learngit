/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-04 11:09:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/ProfileMiniCard';
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';
import { goToConversation } from '@/common/goToConversation';
import { MiniCard } from '@/containers/MiniCard';

type Props = WithNamespaces & {
  id: number;
};

class ProfileMiniCardPersonFooterComponent extends Component<Props> {
  onClickMessage = () => {
    const { id } = this.props;
    const result = goToConversation(id);
    if (result) {
      MiniCard.dismissProfile();
    }
  }

  render() {
    const { id, t } = this.props;
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
            tooltipTitle={t('Messages')}
            onClick={this.onClickMessage}
          >
            chat_bubble
          </JuiIconButton>
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardPersonFooter = translate('translations')(
  ProfileMiniCardPersonFooterComponent,
);

export { ProfileMiniCardPersonFooter };
