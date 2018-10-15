/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-14 14:43:42
* Copyright © RingCentral. All rights reserved.
*/
import PersonModel from '../../../store/models/Person';
import { Person } from 'sdk/src/models';

type UserInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
};
function getUserInfo(firstName?, lastName?, email?) {
  return {
    firstName,
    lastName,
    email,
  };
}
function checkDisplayName(userInfo: UserInfo, matchName: string) {
  const { firstName = '', lastName = '', email = '' } = userInfo;
  const pm = PersonModel.fromJS({
    email,
    id: 12,
    first_name: firstName,
    last_name: lastName,
  } as Person);
  const display = pm.displayName;
  expect(display).toBe(matchName);
}

function checkShortName(userInfo: UserInfo, matchName: string) {
  const { firstName = '', lastName = '', email = '' } = userInfo;
  const pm = PersonModel.fromJS({
    email,
    id: 12,
    first_name: firstName,
    last_name: lastName,
  } as Person);
  const display = pm.shortName;
  expect(display).toBe(matchName);
}

describe('PersonModel', () => {
  describe('displayName', () => {
    it('should return firstName + lastName if user has both', () => {
      checkDisplayName(getUserInfo('John', 'Doe'), 'John Doe');
    });

    it('should return firstName if user has only firstName', () => {
      checkDisplayName(getUserInfo('John'), 'John');
    });

    it('should return lastName if user has only lastName', () => {
      checkDisplayName(getUserInfo('', 'Doe'), 'Doe');
    });

    it('should return email if user has only firstName', () => {
      checkDisplayName(
        getUserInfo('', '', 'john.doe@ringcentral.com'),
        'john.doe@ringcentral.com',
      );
    });
  });

  describe('short name', () => {
    it('should return AH if firstName=alvin,lastName=huang', () => {
      checkShortName(getUserInfo('alvin', 'huang'), 'AH');
    });
    it('should return A if firstName=alvin,lastName=', () => {
      checkShortName(getUserInfo('alvin', ''), 'A');
    });
    it('should return ,A if firstName=,alvin,lastName=', () => {
      checkShortName(getUserInfo(',alvin', ''), ',');
    });
    it('should return 1H if firstName=1alvin,lastName=huang', () => {
      checkShortName(getUserInfo('1alvin', 'huang'), '1H');
    });
    it('should return H if firstName=,lastName=huang', () => {
      checkShortName(getUserInfo('', 'huang'), 'H');
    });
  });
});
