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
    const { handlePrivacy, isPublic, t } = this.props;
    const result = await handlePrivacy();
    if (result === ServiceCommonErrorType.SERVER_ERROR) {
      const content = isPublic
        ? t('markPrivateServerErrorContent')
        : t('markPublicServerErrorContent');
      JuiModal.alert({
        content,
        title: '',
        okText: t('OK'),
        okBtnType: 'text',
        onOK: () => {},
      });
    }
  }

  render() {
    const { isPublic, size, t } = this.props;
    const tooltipKey = isPublic ? 'setStatePrivate' : 'setStatePublic';
    return (
      <JuiIconButton
        size={size}
        color="grey.500"
        className="privacy"
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
