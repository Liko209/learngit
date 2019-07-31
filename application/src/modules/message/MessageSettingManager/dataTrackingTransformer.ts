import {
  EMAIL_NOTIFICATION_OPTIONS,
  NEW_MESSAGE_BADGES_OPTIONS,
  SOUNDS_TYPE,
} from 'sdk/module/profile';

export const BadgeCountSelectDataTrackingOption: {
  [key in NEW_MESSAGE_BADGES_OPTIONS]: string
} = {
  groups_and_mentions: 'Direct messages and mentions only',
  all: 'All new messages',
};
export const EmailNotificationSelectDataTrackingOption: {
  [key in EMAIL_NOTIFICATION_OPTIONS]: string
} = {
  900000: 'Every 15 minutes',
  3600000: 'Every hour',
  0: 'Off',
};

export const SoundSelectDataTrackingOption: { [key in SOUNDS_TYPE]: string } = {
  '0': 'Off',
  '2Beep.wav': '2 Beeps',
  '3Beep.wav': '3 Beeps',
  'Alert1.wav': 'Alert',
  'Alert2.wav': 'Alert 2',
  'Alert3.wav': 'Alert 3',
  'BingBong.wav': 'Bing Bong',
  'Ching.wav': 'Ching',
  'LogDrum2.wav': 'Log Drum',
  'Snap.wav': 'Snap',
  'Button9.wav': 'Squirt',
  'Whoosh.wav': 'Whoosh',
  'Whoosh2.wav': 'Whoosh 2',
  default: 'Default',
};
