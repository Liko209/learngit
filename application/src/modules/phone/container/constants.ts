/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-05 18:39:54
 * Copyright © RingCentral. All rights reserved.
 */

export const ANALYTICS_KEY = {
  VOICEMAIL_HISTORY: 'Voicemail History',
  VOICEMAIL_ACTION_PLAY: 'Play',
  VOICEMAIL_ACTION_PAUSE: 'Pause',
};

export enum ENTITY_TYPE {
  CALL_LOG = 'calllog',
  VOICEMAIL = 'voicemail',
}

export const SOURCE = {
  [ENTITY_TYPE.CALL_LOG]: 'callHistory',
  [ENTITY_TYPE.VOICEMAIL]: 'voicemailList',
};

export const MAX_BUTTON_COUNT = 4;

export const DELAY_DEBOUNCE = 50;
