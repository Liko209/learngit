/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 14:55:33
 * Copyright © RingCentral. All rights reserved.
 */

const MODULE_NAME = 'callLog';

enum CALL_TYPE {
  VOICE = 'Voice',
  FAX = 'Fax',
}

enum CALL_ACTION {
  UNKNOWN = 'Unknown',
  PHONE_CALL = 'Phone Call',
  PHONE_LOGIN = 'Phone Login',
  INCOMING_FAX = 'Incoming Fax',
  ACCEPT_CALL = 'Accept Call',
  FIND_ME = 'FindMe',
  FOLLOW_ME = 'FollowMe',
  OUTGOING_FAX = 'Outgoing Fax',
  CALL_RETURN = 'Call Return',
  CALLING_CARD = 'Calling Card',
  RING_DIRECTLY = 'Ring Directly',
  RING_OUT_WEB = 'RingOut Web',
  VoIP_CALL = 'VoIP Call',
  RING_OUT_RC = 'RingOut PC',
  RING_ME = 'RingMe',
  TRANSFER = 'Transfer',
  INFO_411 = '411 Info',
  EMERGENCY = 'Emergency',
  E911_UPDATE = 'E911 Update',
  SUPPORT = 'Support',
  RING_OUT_MOBILE = 'RingOut Mobile',
}

enum CALL_RESULT {
  UNKNOWN = 'Unknown',
  RESULT_IN_PROGRESS = 'ResultInProgress',
  MISSED = 'Missed',
  CALL_ACCEPTED = 'Call accepted',
  VOICEMAIL = 'Voicemail',
  REJECTED = 'Rejected',
  REPLY = 'Reply',
  RECEIVED = 'Received',
  RECEIVE_ERROR = 'Receive Error',
  FAX_ON_DEMAND = 'Fax on Demand',
  PARTIAL_RECEIVE = 'Partial Receive',
  BLOCKED = 'Blocked',
  CALL_CONNECTED = 'Call connected',
  NO_ANSWER = 'No Answer',
  INTERNATIONAL_DISABLED = 'International Disabled',
  BUSY = 'Busy',
  SEND_ERROR = 'Send Error',
  SENT = 'Sent',
  NO_FAX_MACHINE = 'No fax machine',
  RESULT_EMPTY = 'ResultEmpty',
  ACCOUNT = 'Account',
  SUSPENDED = 'Suspended',
  CALL_FAILED = 'Call Failed',
  CALL_FAILURE_ = 'Call Failure',
  INTERNAL_ERROR_ = 'Internal Error',
  IP_PHONE_OFFLINE = 'IP Phone offline',
  RESTRICTED_NUMBER = 'Restricted Number',
  WRONG_NUMBER = 'Wrong Number',
  STOPPED = 'Stopped',
  HANG_UP = 'Hang up',
  POOR_LINE_QUALITY = 'Poor Line Quality',
  PARTIALLY_SENT = 'Partially Sent',
  INTERNATIONAL_RESTRICTION_ = 'International Restriction',
  ABANDONED = 'Abandoned',
  DECLINED = 'Declined',
  FAX_RECEIPT_ERROR = 'Fax Receipt Error',
  FAX_SEND_ERROR = 'Fax Send Error',
}

enum CALL_REASON {
  ACCEPTED = 'Accepted',
  CONNECTED = 'Connected',
  LINE_BUSY = 'Line Busy',
  NOT_ANSWERED = 'Not Answered',
  NO_ANSWER = 'No Answer',
  HANG_UP = 'Hang Up',
  STOPPED = 'Stopped',
  INTERNAL_ERROR = 'Internal Error',
  NO_CREDIT = 'No Credit',
  RESTRICTED_NUMBER = 'Restricted Number',
  WRONG_NUMBER = 'Wrong Number',
  INTERNATIONAL_DISABLED = 'International Disabled',
  INTERNATIONAL_RESTRICTED = 'International Restricted',
  BAD_NUMBER = 'Bad Number',
  INFO_411_RESTRICTED = 'Info 411 Restricted',
  CUSTOMER_611_RESTRICTED = 'Customer 611 Restricted',
  NO_DIGITAL_LINE = 'No Digital Line',
  FAILED_TRY_AGAIN = 'Failed Try Again',
  MAX_CALL_LIMIT = 'Max Call Limit',
  TOO_MANY_CALLS = 'Too Many Calls',
  CALLS_NOT_ACCEPTED = 'Calls Not Accepted',
  NUMBER_NOT_ALLOWED = 'Number Not Allowed',
  NUMBER_BLOCKED = 'Number Blocked',
  NUMBER_DISABLED_ = 'Number Disabled',
  RESOURCE_ERROR = 'Resource Error',
  CALL_LOOP = 'Call Loop',
  FAX_NOT_RECEIVED = 'Fax Not Received',
  FAX_PARTIALLY_SENT = 'Fax Partially Sent',
  FAX_NOT_SENT = 'Fax Not Sent',
  FAX_POOR_LINE = 'Fax Poor Line',
  FAX_PREPARE_ERROR = 'Fax Prepare Error',
  FAX_SAVE_ERROR = 'Fax Save Error',
  FAX_SEND_ERROR = 'Fax Send Error',
}

enum INDICATES_RECORDING_MODE {
  AUTOMATIC = 'Automatic',
  ON_DEMAND = 'OnDemand',
}

enum CALL_TRANSPORT {
  PSTN = 'PSTN',
  VoIP = 'VoIP',
}

enum LEG_TYPE {
  SIP_FORWARDING = 'SipForwarding',
  SERVICE_MINUS_2 = 'ServiceMinus2',
  SERVICE_MINUS_3 = 'ServiceMinus3',
  PSTN_TO_SIP = 'PstnToSip',
  ACCEPT = 'Accept',
  FIND_ME = 'FindMe',
  FOLLOW_ME = 'FollowMe',
  TEST_CALL = 'TestCall',
  FAX_SENT = 'FaxSent',
  CALL_BACK = 'CallBack',
  CALLING_CARD = 'CallingCard',
  RING_DIRECTLY = 'RingDirectly',
  RING_OUT_WEB_TO_SUBSCRIBER = 'RingOutWebToSubscriber',
  RING_OUT_WEB_TO_CALLER = 'RingOutWebToCaller',
  SIP_TO_PSTN_METERED = 'SipToPstnMetered',
  RING_OUT_CLIENT_TO_SUBSCRIBER = 'RingOutClientToSubscriber',
  RING_OUT_CLIENT_TO_CALLER = 'RingOutClientToCaller',
  RING_ME = 'RingMe',
  TRANSFER_CALL = 'TransferCall',
  SIP_TO_PSTN_UNMETERED = 'SipToPstnUnmetered',
  RING_OUT_DEVICE_TO_SUBSCRIBER = 'RingOutDeviceToSubscriber',
  RING_OUT_DEVICE_TO_CALLER = 'RingOutDeviceToCaller',
  RING_OUT_ONE_LEG_TO_CALLER = 'RingOutOneLegToCaller',
  EXTENSION_TO_EXTENSION = 'ExtensionToExtension',
  CALL_PARK = 'CallPark',
  PAGING_SERVER = 'PagingServer',
  HUNTING = 'Hunting',
  OUTGOING_FREE_SP_DL = 'OutgoingFreeSpDl',
  PARK_LOCATION = 'ParkLocation',
  CONFERENCE_CALL = 'ConferenceCall',
  MOBILE_APP = 'MobileApp',
  MOVE_TO_CONFERENCE = 'MoveToConference',
  UNKNOWN = 'Unknown',
}

enum CALL_LOG_SOURCE {
  ALL = 'All',
  MISSED = 'Missed',
}

const MISSED_CALL_BADGE_ID = `${MODULE_NAME}.MISSED_CALLS`;

export {
  CALL_TYPE,
  CALL_ACTION,
  CALL_RESULT,
  CALL_REASON,
  INDICATES_RECORDING_MODE,
  CALL_TRANSPORT,
  LEG_TYPE,
  CALL_LOG_SOURCE,
  MISSED_CALL_BADGE_ID,
  MODULE_NAME,
};
