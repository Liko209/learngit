/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardGroupFooterViewProps } from './types';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/Profile/MiniCard';
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';
import { goToConversation } from '@/common/goToConversation';
import { TypeDictionary } from 'sdk/utils';
import portalManager from '@/common/PortalManager';

@observer
class ProfileMiniCardGroupFooter extends Component<
  WithNamespaces & ProfileMiniCardGroupFooterViewProps
> {
  onClickMessage = () => {
    const { id } = this.props;
    const result = goToConversation({ id });
    if (result) {
      portalManager.dismissLast();
    }
  }

  getAriaLabelKey = () => {
    const { typeId } = this.props;
    const mapping = {
      [TypeDictionary.TYPE_ID_TEAM]: 'ariaGoToTeam',
      [TypeDictionary.TYPE_ID_GROUP]: 'ariaGoToGroup',
    };
    return mapping[typeId];
  }

  render() {
    const { id, t, showMessage, group } = this.props;
    return (
      <>
        <JuiProfileMiniCardFooterLeft>
          <ProfileButton id={id} />
        </JuiProfileMiniCardFooterLeft>
        <JuiProfileMiniCardFooterRight>
          {showMessage && (
            <JuiIconButton
              size="medium"
              color="primary"
              variant="plain"
              tooltipTitle={t('message.Messages')}
              onClick={this.onClickMessage}
              ariaLabel={t(this.getAriaLabelKey(), { name: group.displayName })}
            >
              chat_bubble
            </JuiIconButton>
          )}
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardGroupFooterView = translate('translations')(
  ProfileMiniCardGroupFooter,
);

export { ProfileMiniCardGroupFooterView };
