/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 13:56:24
 * Copyright © RingCentral. All rights reserved.
 */

enum PhoneUMIType {
  ALL = 1,
  MISSEDCALL,
  VOICEMAIL,
}

type PhoneUMIProps = {
  type?: PhoneUMIType;
};

type PhoneUMIViewProps = {
  missedCallUMI: number;
  voicemailUMI: number;
  unreadCount: number;
  isDefaultPhoneApp: boolean;
};

export { PhoneUMIProps, PhoneUMIViewProps, PhoneUMIType };
