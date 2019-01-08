/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import portalManager from '@/common/PortalManager';

type BaseType = {
  isAlert?: boolean;
} & JuiModalProps;

type BaseModalType = WithNamespaces & BaseType;

const BaseModal = (props: BaseModalType) => {
  const { t, isAlert, ...newConfig } = props;
  const defaultBtnText = {
    okText: t('OK'),
    cancelText: t('Cancel'),
  };

  if (isAlert) {
    Reflect.deleteProperty(defaultBtnText, 'cancelText');
  }

  const currentConfig = {
    ...defaultBtnText,
    ...newConfig,
  };

  return <JuiModal {...currentConfig} />;
};

const TranslateModal = translate('translates')(BaseModal);

function modal(config: BaseType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const { dismiss, show } = portalManager.wrapper(TranslateModal);

  const currentConfig = {
    ...newConfig,
    isAlert,
    open: true,
    async onOK() {
      onOK && (await onOK());
      dismiss();
    },
    onCancel() {
      onCancel && onCancel();
      dismiss();
    },
  };

  show(undefined, currentConfig);
  return {
    dismiss,
  };
}

export { modal };
