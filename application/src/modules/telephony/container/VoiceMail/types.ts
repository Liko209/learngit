/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type VoiceMailProps = {};

type VoiceMailViewProps = {
  sendToVoiceMail: () => void;
  isTransferPage: boolean;
  transferNumber: string;
  isIncomingCall: boolean;
};

export { VoiceMailProps, VoiceMailViewProps };
