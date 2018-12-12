/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import ReactDOM from 'react-dom';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import { genDivAndDismiss } from '@/common/genDivAndDismiss';
import ThemeProvider from '@/containers/ThemeProvider';

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
  const { container, dismiss } = genDivAndDismiss();

  const { onOK, onCancel, isAlert, ...newConfig } = config;

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

  function render(props: JuiModalProps) {
    ReactDOM.render(
      <ThemeProvider>
        <TranslateModal {...props} />
      </ThemeProvider>,
      container,
    );
  }

  render(currentConfig);

  return {
    dismiss,
  };
}

export { modal };
