/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiModalProps, JuiDialogFuncProps } from 'jui/components/Dialog';
import { dialog } from './Dialog';
import { modal } from './Modal';
import { ModalPortal } from './ModalPortal';
export { default as DialogContext } from './DialogContext';

class Dialog {
  static simple(
    component: JSX.Element | React.ComponentType<any>,
    config?: JuiDialogFuncProps,
  ) {
    const newConfig = {
      open: true,
      ...config,
    };
    return modal(component, newConfig);
  }

  static alert(props: JuiModalProps) {
    const config = {
      isAlert: true,
      ...props,
    };
    return dialog(config);
  }

  static confirm(props: JuiModalProps) {
    return dialog(props);
  }
}

export { Dialog, ModalPortal };
