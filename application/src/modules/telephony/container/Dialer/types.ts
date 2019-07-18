/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 17:21:15
 * Copyright © RingCentral. All rights reserved.
 */

type DialerProps = {};

type DialerViewProps = {
  isIncomingCall: boolean;
  keypadEntered: boolean;
  dialerId: string;
  dialerMinimizeTranslateX: number;
  dialerMinimizeTranslateY: number;
  startMinimizeAnimation: boolean;
  callWindowState: string;
  shouldDisplayDialer: boolean;
  shouldDisplayCallCtrl: boolean;
};

export { DialerProps, DialerViewProps };
