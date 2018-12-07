/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:41:51
 * Copyright © RingCentral. All rights reserved.
 */
// import { JuiSnackbarsType, MessageAlignment } from 'jui/components/Snackbars';
import { ShowNotificationOptions } from '@/containers/Notification';
// import {Snackbar} from '@material-ui/core/Snackbar';

type ToastProps = ShowNotificationOptions & {
  id?: number;
  // type: JuiSnackbarsType;
  // message: React.ReactNode | string;
  // action?: React.ReactNode;
  // messageAlign?: MessageAlignment;
  // autoHideDuration?: number;
  // dismissible?: boolean;
  dismiss: () => void;
};

type ToastViewProps = ToastProps;
export { ToastProps, ToastViewProps };
