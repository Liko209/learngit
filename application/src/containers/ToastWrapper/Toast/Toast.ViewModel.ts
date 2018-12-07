/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ToastViewProps, ToastProps } from './types';
import StoreViewModel from '@/store/ViewModel';
import { JuiSnackbarsType, MessageAlignment } from 'jui/components/Snackbars';

class ToastViewModel extends StoreViewModel<ToastProps>
  implements ToastViewProps {
  type: JuiSnackbarsType;

  autoHideDuration?: number;

  dismissible?: boolean;

  message: React.ReactNode | string;

  action?: React.ReactNode;
  messageAlign?: MessageAlignment;

  dismiss: () => void;

  onReceiveProps(props: ToastProps) {
    this.type = props.type;
    this.message = props.message;
    this.autoHideDuration = props.autoHideDuration;
    this.dismissible = props.dismissible;
    this.messageAlign = props.messageAlign;
    this.action = props.action;
    this.dismiss = props.dismiss;
  }
}

export { ToastViewModel };
