/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import {
  JuiModal,
  JuiModalProps,
  JuiDialogFuncProps,
} from 'jui/components/Dialog';
import { modal } from './Modal';
import { dialog } from './Dialog';

type ReturnFunc = {
  destroy: () => void;
};

JuiModal.alert = function (props: JuiModalProps): ReturnFunc {
  const config = {
    isAlert: true,
    ...props,
  };
  return modal(config);
};

JuiModal.confirm = function (props: JuiModalProps): ReturnFunc {
  return modal(props);
};

JuiModal.open = function (
  component: React.ComponentType<any>,
  config?: JuiDialogFuncProps,
): ReturnFunc {
  const newConfig = {
    open: true,
    ...config,
  };
  return dialog(component, newConfig);
};

export { JuiModal };
