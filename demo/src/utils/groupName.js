/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-15 18:39:22
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import storeManager, { ENTITY_NAME } from '#/store';

const hasDisplayName = person => person && person.displayName;

export const getGroupName = (memberIds, userId) => {
  let peopleName = '';
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  if (memberIds.length === 1 && memberIds[0] === userId) {
    const person = personStore.get(userId);
    if (hasDisplayName(person)) {
      peopleName = person.displayName;
      peopleName += ' (me)';
    }
  } else {
    const groupMemberIDs = _.difference(memberIds, [userId]);
    groupMemberIDs.forEach((pid) => {
      const person = personStore.get(pid);
      if (hasDisplayName(person)) {
        // if not conversationTab will be render underfined
        peopleName += person.displayName;
        peopleName += ', ';
      }
    });

    if (peopleName.length > 0) {
      peopleName = peopleName.substr(0, peopleName.length - 2);
    }
  }
  return peopleName;
};
