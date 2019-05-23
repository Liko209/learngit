/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import portalManager from '@/common/PortalManager';
import { withTranslation, WithTranslation } from 'react-i18next';

type BaseType = {
  isAlert?: boolean;
  loading?: boolean;
} & JuiModalProps;

const BaseDialogComponent = (props: BaseType & WithTranslation) => {
  const { isAlert, loading, t, ...newConfig } = props;
  const defaultBtnText = {
    okText: t('common.dialog.OK'),
    cancelText: t('common.dialog.cancel'),
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

const BaseDialog = withTranslation('translations')(BaseDialogComponent);

function dialog(config: BaseType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

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
