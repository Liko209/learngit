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
  loading?: boolean;
} & JuiModalProps;

function dialog(config: BaseType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const BaseDialog = (props: BaseType) => {
    const { isAlert, loading, ...newConfig } = props;
    const defaultBtnText = {
      okText: i18next.t('common.dialog.OK'),
      cancelText: i18next.t('common.dialog.cancel'),
    };

    if (isAlert) {
      Reflect.deleteProperty(defaultBtnText, 'cancelText');
    }

    const currentConfig = {
      ...defaultBtnText,
      ...newConfig,
    };

    return <JuiModal {...currentConfig} loading={loading} />;
  };

  const { dismiss, show, startLoading, stopLoading } = portalManager.wrapper(
    BaseDialog,
  );

  const currentConfig = {
    ...newConfig,
    isAlert,
    open: true,
    async onOK() {
      const result = onOK && (await onOK());
      if (result !== false) {
        dismiss();
      }
    },
    onCancel() {
      onCancel && onCancel();
      dismiss();
    },
  };

  show(currentConfig);
  return {
    dismiss,
    startLoading,
    stopLoading,
  };
}

export { dialog };
