/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import portalManager from '@/common/PortalManager';

type BaseModalType = {
  isAlert?: boolean;
} & JuiModalProps;

const BaseModal = (props: BaseModalType) => {
  const { isAlert, ...newConfig } = props;
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

function modal(config: BaseModalType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const { dismiss, show } = portalManager.wrapper(BaseModal);

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
