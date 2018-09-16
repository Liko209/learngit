/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-14 14:43:42
* Copyright © RingCentral. All rights reserved.
*/
import PersonModel from '../../../store/models/Person';
describe('PersonModel', () => {
  describe('displayName', () => {
    it('should return firstName + lastName if user has both', () => {
      const pm = PersonModel.fromJS({
        id: 12,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@ringcentral.com',
      });
      expect(pm.displayName).toBe('John Doe');
    });

    it('should return firstName if user has only firstName', () => {
      const pm = PersonModel.fromJS({
        id: 12,
        first_name: 'John',
        last_name: '',
        email: 'john.doe@ringcentral.com',
      });
      expect(pm.displayName).toBe('John');
    });

    it('should return lastName if user has only firstName', () => {
      const pm = PersonModel.fromJS({
        id: 12,
        first_name: '',
        last_name: 'Doe',
        email: 'john.doe@ringcentral.com',
      });
      expect(pm.displayName).toBe('Doe');
    });

    it('should return email if user has only firstName', () => {
      const pm = PersonModel.fromJS({
        id: 12,
        first_name: '',
        last_name: '',
        email: 'john.doe@ringcentral.com',
      });
      expect(pm.displayName).toBe('john.doe@ringcentral.com');
    });
  });
});
