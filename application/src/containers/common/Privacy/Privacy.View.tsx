/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { PrivacyViewProps, PrivacyProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = PrivacyViewProps & WithTranslation & PrivacyProps;

class PrivacyViewComponent extends Component<Props> {
  flashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  onClickPrivacy = async () => {
    const { handlePrivacy } = this.props;
    try {
      await handlePrivacy();
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this.flashToast('people.prompt.teamNetError');
      } else {
        this.flashToast('people.prompt.markPrivateServerErrorForTeam');
      }
    }
  }

  getTipText = () => {
    const { isPublic, isAdmin } = this.props;
    if (isAdmin) {
      return isPublic
        ? 'people.team.changeToPrivate'
        : 'people.team.changeToPublic';
    }
    return isPublic ? 'people.team.publicTeam' : 'people.team.privateTeam';
  }

  render() {
    const { isPublic, size, t, isAdmin, isTeam } = this.props;
    if (!isTeam) {
      return null;
    }
    const tooltipKey = this.getTipText();
    return (
      <JuiIconButton
        size={size}
        color="grey.500"
        className="privacy"
        disabled={!isAdmin}
        alwaysEnableTooltip={true}
        onClick={this.onClickPrivacy}
        tooltipTitle={t(tooltipKey)}
      >
        {isPublic ? 'lock_open' : 'lock'}
      </JuiIconButton>
    );
  }
}

const PrivacyView = withTranslation('translations')(PrivacyViewComponent);

export { PrivacyView };
