/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-06-17 14:52:59
 * Copyright © RingCentral. All rights reserved.
 */
interface ITelephonyDelegate {
  onMadeOutgoingCall(callId: number): void;
  onReceiveIncomingCall(callId: number): void;
}

export { ITelephonyDelegate };
