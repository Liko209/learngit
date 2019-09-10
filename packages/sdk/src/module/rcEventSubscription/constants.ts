/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-23 11:03:09
 * Copyright © RingCentral. All rights reserved.
 */

const EVENT_PREFIX = '/restapi/v1.0/account/~/extension/~/';

enum RCSubscriptionKeys {
  TelephonyDetail = 'presence?detailedTelephonyState=true&sipData=true',
  MissedCall = 'missed-calls',
  Voicemail = 'voicemail',
  MessageStore = 'message-store',
}

enum TELEPHONY_STATUS {
  NoCall = 'NoCall',
  CallConnected = 'CallConnected',
  Ringing = 'Ringing',
  OnHold = 'OnHold',
  ParkedCall = 'ParkedCall',
}

const PubNubEncryptionAlgorithm = 'AES';

export {
  RCSubscriptionKeys,
  EVENT_PREFIX,
  PubNubEncryptionAlgorithm,
  TELEPHONY_STATUS,
};
