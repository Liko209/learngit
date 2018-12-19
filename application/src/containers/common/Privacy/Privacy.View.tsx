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

type Props = PrivacyViewProps & WithNamespaces;

class PrivacyViewComponent extends Component<Props> {

  flashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  onClickPrivacy = async () => {
    const { handlePrivacy, t, isOffline } = this.props;
    if (isOffline) {
      this.flashToast(t('teamNetError'));
      // if isoffline broken the function
      return;
    }
    const result = await handlePrivacy();
    if (!result || typeof (result) !== 'boolean') {
      this.flashToast(t('markPrivateServerErrorForTeam'));
    }
  }

  getTipText = () => {
    const { isPublic, isAdmin } = this.props;
    if (isAdmin) {
      return isPublic ? 'setStatePrivate' : 'setStatePublic';
    }
    return isPublic ? 'privateTeam' : 'publicTeam';
  }

  render() {
    const { isPublic, size, t, isAdmin } = this.props;
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
