/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import portalManager from '@/common/PortalManager';

type BaseType = {
  isAlert?: boolean;
} & JuiModalProps;

function modal(config: BaseType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const BaseModal = (props: BaseType) => {
    const { isAlert, ...newConfig } = props;
    const defaultBtnText = {
      okText: i18next.t('OK'),
      cancelText: i18next.t('Cancel'),
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

  show(currentConfig);
  return {
    dismiss,
  };
}

export { modal };
