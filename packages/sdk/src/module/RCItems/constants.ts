/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

enum CALL_DIRECTION {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
}

enum MESSAGE_STATUS {
  QUEUED = 'Queued',
  SENT = 'Sent',
  DELIVERED = 'Delivered',
  DELIVERY_FAILED = 'DeliveryFailed',
  SENDING_FAILED = 'SendingFailed',
  RECEIVED = 'Received',
}

enum FAX_ERROR_CODE {
  INTERNATIONAL_CALLING_DISABLED = 'InternationalCallingDisabled',
  DESTINATION_COUNTRY_DISABLED = 'DestinationCountryDisabled',
  NO_ANSWER = 'NoAnswer',
  LINE_BUSY = 'LineBusy',
  CALLER_HUNG_UP = 'CallerHungUp',
  UNKNOWN_COUNTRY_CODE = 'UnknownCountryCode',
  INVALID_NUMBER = 'InvalidNumber',
  NOT_ACCEPTED = 'NotAccepted',
  CALL_DECLINED = 'CallDeclined',
  TOO_MANY_CALLS_PER_LINE = 'TooManyCallsPerLine',
  NOT_ENOUGH_CREDITS = 'NotEnoughCredits',
  SENT_PARTIALLY = 'SentPartially',
  CALL_FAILED = 'CallFailed',
}

enum ATTACHMENT_TYPE {
  AUDIO_RECORDING = 'AudioRecording',
  AUDIO_TRANSCRIPTION_ = 'AudioTranscription',
  TEXT = 'Text',
  SOURCE_DOCUMENT = 'SourceDocument',
  RENDERED_DOCUMENT = 'RenderedDocument',
  MMS_ATTACHMENT = 'MmsAttachment',
}

enum MESSAGE_AVAILABILITY {
  ALIVE = 'Alive',
  DELETED = 'Deleted',
  PURGED = 'Purged',
}

enum FAX_RESOLUTION {
  HIGH = 'High',
  LOW = 'Low',
}

enum MESSAGE_PRIORITY {
  NORMAL = 'Normal',
  HIGH = 'High',
}

enum READ_STATUS {
  READ = 'Read',
  UNREAD = 'Unread',
}

enum RC_MESSAGE_TYPE {
  FAX = 'Fax',
  SMS = 'SMS',
  VOICEMAIL = 'VoiceMail',
  PAGER = 'Pager',
  TEXT = 'Text',
}

enum VM_TRANSCRIPTION_STATUS {
  NOT_AVAILABLE = 'NotAvailable',
  IN_PROGRESS = 'InProgress',
  TIME_OUT = 'TimedOut',
  COMPLETED = 'Completed',
  COMPLETED_PARTIALLY = 'CompletedPartially',
  FAILED = 'Failed',
}

const DEFAULT_FETCH_SIZE = 50;

enum SYNC_DIRECTION {
  NEWER,
  OLDER,
}

enum BADGE_STATUS {
  IDLE,
  INITIALIZING,
  INITIALIZED,
}

export {
  CALL_DIRECTION,
  MESSAGE_STATUS,
  FAX_ERROR_CODE,
  ATTACHMENT_TYPE,
  MESSAGE_AVAILABILITY,
  FAX_RESOLUTION,
  MESSAGE_PRIORITY,
  READ_STATUS,
  RC_MESSAGE_TYPE,
  VM_TRANSCRIPTION_STATUS,
  DEFAULT_FETCH_SIZE,
  SYNC_DIRECTION,
  BADGE_STATUS,
};
