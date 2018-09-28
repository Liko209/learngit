/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-14 14:43:42
* Copyright © RingCentral. All rights reserved.
*/
import PersonModel from '../../../store/models/Person';

type UserInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
};
function getUserInfo(firstName? = 'John', lastName? = 'Doe', email? = 'john.doe@ringcentral.com') {
  return {
    firstName,
    lastName,
    email,
  };
}
function handleCommonMock(userInfo: UserInfo, matchName: string) {
  const pm = PersonModel.fromJS({
    id: 12,
    first_name: userInfo && userInfo!.firstName,
    last_name: userInfo && userInfo!.lastName,
    email: userInfo && userInfo!.email,
  });
  const display = userInfo.email ? pm.displayName : pm.shortName;
  expect(display).toBe(matchName);
}
describe('PersonModel', () => {
  describe('displayName', () => {
    it('should return firstName + lastName if user has both', () => {
      handleCommonMock(getUserInfo(), 'John Doe');
    });

    it('should return firstName if user has only firstName', () => {
      handleCommonMock(getUserInfo('', ''), 'John');
    });

    it('should return lastName if user has only firstName', () => {
      handleCommonMock(getUserInfo('', 'Doe'), 'Doe');
    });

    it('should return email if user has only firstName', () => {
      handleCommonMock(getUserInfo('', ''), 'john.doe@ringcentral.com');
    });
  });

  describe('short name', () => {
    it('should return AH if firstName=alvin,lastName=huang', () => {
      handleCommonMock(getUserInfo('alvin', 'huang', ''), 'AH');
    });
    it('should return A if firstName=alvin,lastName=', () => {
      handleCommonMock(getUserInfo('alvin', '', ''), 'A');
    });
    it('should return ,A if firstName=,alvin,lastName=', () => {
      handleCommonMock(getUserInfo(',alvin', '', ''), ',A');
    });
    it('should return 1H if firstName=1alvin,lastName=huang', () => {
      handleCommonMock(getUserInfo('1alvin', 'huang', ''), '1H');
    });
    it('should return H if firstName=,lastName=huang', () => {
      handleCommonMock(getUserInfo('', 'huang', ''), 'H');
    });
  });
});
