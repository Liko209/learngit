/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiModal } from 'jui/components/Dialog//Modal1';
import { JuiAlertProps } from 'jui/components/Dialog/Alert1';
import { JuiConfirmProps } from 'jui/components/Dialog/Confirm1';
import { modal } from './Modal';

JuiModal.alert = function (props: JuiAlertProps) {
  return modal(props);
};

JuiModal.confirm = function (props: JuiConfirmProps) {
  return modal(props);
};

export { JuiModal };
