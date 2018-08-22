/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-15 18:39:22
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import storeManager, { ENTITY_NAME } from '../store';
import PersonModel from '../store/models/Person';
import GroupModel from '../store/models/Group';

const hasDisplayName = (person: PersonModel) => person && person.displayName;

export const getGroupName = (group: GroupModel, userId?: number) => {
  if (group.isTeam || !userId) {
    return group.setAbbreviation;
  }
  const memberIds: number[] = group.members;
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
    const toTitleCase = (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    const compareFunc = (a: string, b: string) =>
      (/[a-zA-Z]/.test(a) && !/[a-zA-Z]/.test(b)) ||
        (/0-9/.test(a) && /[^a-zA-Z0-9]/.test(b)) ? -1 :
        a.toLowerCase().localeCompare(b.toLowerCase());

    if (groupMemberIDs.length === 1) {
      // 1 other member, 1:1 conversation
      const otherMember: PersonModel = personStore.get(groupMemberIDs[0]);
      peopleName = otherMember.displayName;
    } else if (groupMemberIDs.length > 1) {
      // more than one members, group conversation
      const names: string[] = [];
      const emails: string[] = [];
      groupMemberIDs.map(id => personStore.get(id)).forEach(({ firstName, lastName, email }) => {
        if (!firstName && !lastName) {
          emails.push(email);
        } else if (firstName) {
          names.push(toTitleCase(firstName));
        } else if (lastName) {
          names.push(toTitleCase(lastName));
        }
      });
      peopleName = names.sort(compareFunc).concat(emails.sort(compareFunc)).join(', ');
    }
  }
  return peopleName;
};
