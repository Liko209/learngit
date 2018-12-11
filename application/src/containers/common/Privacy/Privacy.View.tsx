/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { PrivacyViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';

type Props = PrivacyViewProps & WithNamespaces;

class PrivacyViewComponent extends Component<Props> {
  onClickPrivacy = async () => {
    const { isAction, handlePrivacy, isPublic, t } = this.props;
    if (!isAction) {
      return;
    }
    const result = await handlePrivacy();
    if (result === ServiceCommonErrorType.SERVER_ERROR) {
      const content = isPublic
        ? t('markPrivateServerErrorContent')
        : t('markPublicServerErrorContent');
      JuiModal.alert({
        content,
        title: '',
        okText: t('OK'),
        okVariant: 'text',
        onOK: () => {},
      });
    }
  }

  getTooltipKey = () => {
    const { isAction, isPublic } = this.props;
    if (isAction) {
      return isPublic ? 'setPrivateStatus' : 'setPublicStatus';
    }
    return isPublic ? 'currentStatePublic' : 'currentStatePrivate';
  }

  render() {
    const { isPublic, size, variant, color, disableToolTip, t } = this.props;
    return (
      <JuiIconButton
        size={size}
        variant={variant}
        color={color}
        className="privacy"
        disableToolTip={disableToolTip}
        onClick={this.onClickPrivacy}
        tooltipTitle={t(this.getTooltipKey())}
      >
        {isPublic ? 'lock_open' : 'lock'}
      </JuiIconButton>
    );
  }
}

const PrivacyView = translate('translations')(PrivacyViewComponent);

export { PrivacyView };
