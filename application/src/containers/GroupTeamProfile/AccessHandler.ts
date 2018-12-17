/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { TypeDictionary } from 'sdk/utils';

export function accessHandler(type: number, name?: string) {
  let checkMoreOption = '';
  let copyUrl = '';
  let goToMessageInfo = '';
  if (type === TypeDictionary.TYPE_ID_GROUP) {
    checkMoreOption = 'checkMoreGroupOption';
    copyUrl = 'copyGroupUrl';
    goToMessageInfo = 'goToGroupConversation';
  } else if (type === TypeDictionary.TYPE_ID_TEAM) {
    checkMoreOption = 'checkMoreTeamOption';
    copyUrl = 'copyTeamUrl';
    goToMessageInfo = 'goToTeamConversation';
  }
  return {
    checkMoreOption,
    copyUrl,
    goToMessageInfo,
  };
}
