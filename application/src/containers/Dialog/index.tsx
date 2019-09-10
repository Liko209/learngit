/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiModalProps, JuiDialogFuncProps } from 'jui/components/Dialog';
import { dialog } from './Dialog';
import { modal } from './Modal';
import { ModalPortal } from './ModalPortal';
import { withEscTracking } from './WrapDataTracking';

export { default as DialogContext } from './DialogContext';

class Dialog {
  static simple(
    component: JSX.Element | React.ComponentType<any>,
    config?: JuiDialogFuncProps,
    key?: string,
  ) {
    const { componentProps = {}, ...rest } = config || {};
    const newConfig = {
      open: true,
      ...rest,
      ...componentProps,
    };
    return modal(component, newConfig, key);
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

export { Dialog, ModalPortal, withEscTracking };
