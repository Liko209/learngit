/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';

export function accessHandler(type: CONVERSATION_TYPES) {
  let checkMoreOption = '';
  let copyUrl = '';
  if (type === CONVERSATION_TYPES.NORMAL_GROUP) {
    checkMoreOption = 'checkMoreGroupOption';
    copyUrl = 'copyGroupUrl';
  } else if (type === CONVERSATION_TYPES.TEAM) {
    checkMoreOption = 'checkMoreTeamOption';
    copyUrl = 'copyTeamUrl';
  }
  return {
    checkMoreOption,
    copyUrl,
  };
}
