/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-15 18:39:22
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import storeManager, { ENTITY_NAME } from '../store';
import PersonModel from '../store/models/Person';
import GroupModel from '../store/models/Group';
import { toTitleCase } from '../utils/case';

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
    const compareCharacters = (a: string, b: string) => {
      if (a === b) {
        return 0;
      }
      const priority = (char: string) => !char ? 0 : /[a-z]/i.test(char) ? 1 : /[0-9]/.test(char) ? 2 : 3;
      return (priority(a) - priority(b)) || a.toLowerCase().localeCompare(b.toLowerCase());
    };

    const compareNames = (name1: string, name2: string) => {
      const maxLength = Math.max(name1.length, name2.length);
      for (let i = 0; i < maxLength; i += 1) {
        const result = compareCharacters(name1[i], name2[i]);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    };

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
      peopleName = names.sort(compareNames).concat(emails.sort(compareNames)).join(', ');
    }
  }
  return peopleName;
};
