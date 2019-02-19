/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';

<<<<<<< HEAD
type BaseType = {
  isAlert?: boolean;
} & JuiModalProps;

function modal(config: BaseType) {
  const { onOK, onCancel, isAlert, ...newConfig } = config;

  const BaseModal = (props: BaseType) => {
    const { isAlert, ...newConfig } = props;
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

    return <JuiModal {...currentConfig} />;
=======
type Props = {
  componentProps?: any;
} & JuiDialogProps;

function modal(
  component: React.ComponentType<any> | JSX.Element,
  props: Props,
) {
  const Component = component;
  const Dialog = () => {
    return (
      <JuiDialog {...props}>
        {Component instanceof Function ? <Component /> : Component}
      </JuiDialog>
    );
>>>>>>> develop
  };

  const { dismiss, show } = portalManager.wrapper(Dialog);

  show();
  return {
    dismiss,
  };
}

export { modal };
