/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiModal, JuiModalProps } from 'jui/components/Dialog/Modal';
import { modal } from './Modal';

JuiModal.alert = function (props: JuiModalProps) {
  const config = {
    isAlert: true,
    ...props,
  };
  return modal(config);
};

JuiModal.confirm = function (props: JuiModalProps) {
  return modal(props);
};

export { JuiModal };
