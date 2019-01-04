/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiModalProps, JuiDialogFuncProps } from 'jui/components/Dialog';
import { modal } from './Modal';
import { dialog } from './Dialog';
import { DialogPortal } from './DialogPortal';

type ReturnFunc = {
  dismiss: () => void;
};

class Dialog {
  static simple(
    component: JSX.Element | React.ComponentType<any>,
    config?: JuiDialogFuncProps,
  ): ReturnFunc {
    const newConfig = {
      open: true,
      ...config,
    };
    return dialog(component, newConfig);
  }

  static alert(props: JuiModalProps): ReturnFunc {
    const config = {
      isAlert: true,
      ...props,
    };
    return modal(config);
  }

  static confirm(props: JuiModalProps): ReturnFunc {
    return modal(props);
  }
}

export { Dialog, DialogPortal };
