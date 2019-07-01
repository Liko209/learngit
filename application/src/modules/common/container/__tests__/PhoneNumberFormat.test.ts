import * as utils from '@/store/utils';
import * as phoneNumberUtils from '@/common/postParser/utils';
import { formatPhoneNumber } from '../PhoneNumberFormat';

beforeEach(() => {
  jest.mock('@/store/utils');
  jest.mock('@/common/postParser/utils');
  jest.spyOn(utils, 'getEntity').mockReturnValue({
    formattedPhoneNumber: '',
  });
  jest.spyOn(phoneNumberUtils, 'isValidPhoneNumber').mockReturnValue(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('PhoneNumberFormat', () => {
  describe('shouldValidate', () => {
    it('should call getEntity directly when is false', () => {
      jest.spyOn(phoneNumberUtils, 'isValidPhoneNumber').mockReturnValue(true);
      formatPhoneNumber('123', false);
      expect(utils.getEntity).toBeCalledTimes(1);
    });

    it('should not call getEntity directly when is true and isValidPhoneNumber returns false', () => {
      jest.spyOn(phoneNumberUtils, 'isValidPhoneNumber').mockReturnValue(false);
      const args = '123';
      const res = formatPhoneNumber(args);
      expect(utils.getEntity).not.toBeCalled();
      expect(res).toEqual(args);
    });

    it('should not call getEntity directly when is true and isValidPhoneNumber returns false', () => {
      formatPhoneNumber('123');
      expect(utils.getEntity).toBeCalledTimes(1);
    });
  });
});
