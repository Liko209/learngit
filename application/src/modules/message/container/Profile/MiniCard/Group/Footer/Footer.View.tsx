/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ProfileMiniCardGroupFooterViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/Profile/MiniCard';
import { JuiIconButton, JuiButton } from 'jui/components/Buttons';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { TypeDictionary } from 'sdk/utils';
import portalManager from '@/common/PortalManager';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { ProfileDialogGroup } from '@/modules/message/container/Profile/Dialog/Group';
import { AudioConference } from '@/modules/telephony/container/AudioConference';
import { analyticsCollector } from '@/AnalyticsCollector';

@observer
class ProfileMiniCardGroupFooter extends Component<
  WithTranslation & ProfileMiniCardGroupFooterViewProps
> {
  onClickMessage = () => {
    analyticsCollector.goToConversation('miniProfile', this.props.analysisType);
    const { id } = this.props;
    const result = goToConversationWithLoading({ id });
    if (result) {
      portalManager.dismissLast();
    }
  };

  getAriaLabelKey = () => {
    const { typeId } = this.props;
    const mapping = {
      [TypeDictionary.TYPE_ID_TEAM]: 'ariaGoToTeam',
      [TypeDictionary.TYPE_ID_GROUP]: 'ariaGoToGroup',
    };
    return mapping[typeId];
  };

  getDataTrackingCategory() {
    const { typeId } = this.props;
    const mapping = {
      [TypeDictionary.TYPE_ID_TEAM]: 'Team',
      [TypeDictionary.TYPE_ID_GROUP]: 'Group',
    };
    return mapping[typeId];
  }

  handleCloseMiniCard = () => {
    portalManager.dismissLast();
  };

  render() {
    const { id, t, showMessage, group } = this.props;
    return (
      <>
        <JuiProfileMiniCardFooterLeft>
          <OpenProfileDialog
            id={id}
            profileDialog={ProfileDialogGroup}
            beforeClick={this.handleCloseMiniCard}
            dataTrackingProps={{
              category: this.getDataTrackingCategory(),
              source: 'miniProfile',
            }}
          >
            <JuiButton variant="text" color="primary" size="medium">
              {t('people.team.profile')}
            </JuiButton>
          </OpenProfileDialog>
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
              chat
            </JuiIconButton>
          )}
          <AudioConference
            groupId={id}
            variant="plain"
            size="medium"
            color="primary"
            analysisSource="miniProfile"
          />
        </JuiProfileMiniCardFooterRight>
      </>
    );
  }
}

const ProfileMiniCardGroupFooterView = withTranslation('translations')(
  ProfileMiniCardGroupFooter,
);

export { ProfileMiniCardGroupFooterView };
