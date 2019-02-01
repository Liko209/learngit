/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { PrivacyViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = PrivacyViewProps & WithNamespaces;

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
        this.flashToast('teamNetError');
      } else {
        this.flashToast('markPrivateServerErrorForTeam');
      }
    }
  }

  getTipText = () => {
    const { isPublic, isAdmin } = this.props;
    if (isAdmin) {
      return isPublic ? 'setStatePrivate' : 'setStatePublic';
    }
    return isPublic ? 'publicTeam' : 'privateTeam';
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

const PrivacyView = translate('translations')(PrivacyViewComponent);

export { PrivacyView };
