/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:41:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ShowNotificationOptions } from '@/containers/Notification';

type ToastProps = ShowNotificationOptions & {
  id?: number;
  dismiss: () => void;
};

type ToastViewProps = ToastProps;
export { ToastProps, ToastViewProps };
