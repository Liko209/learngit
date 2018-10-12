/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@/containers/ThemeProvider';
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';

type BaseType = {
  isAlert?: boolean;
} & JuiModalProps;

type BaseModalType = {
  t: TranslationFunction;
} & BaseType;

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
  const div = document.createElement('div');
  document.getElementById('root')!.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const currentConfig = {
    ...newConfig,
    isAlert,
    open: true,
    onOK() {
      onOK && onOK();
      destroy();
    },
    onCancel() {
      onCancel && onCancel();
      destroy();
    },
  };

  function render(props: JuiModalProps) {
    ReactDOM.render(
      <ThemeProvider>
        <TranslateModal {...props} />
      </ThemeProvider>,
      div,
    );
  }

  render(currentConfig);

  return {
    destroy,
  };
}

export { modal };
