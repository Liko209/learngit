/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 16:17:53
 * Copyright © RingCentral. All rights reserved.
 */
import { formatPhoneNumber } from '../../helpers';
import { CallerIdItemViewModel } from '../CallerIdItem.ViewModel';

let callerIdItemViewModel: CallerIdItemViewModel | undefined;

jest.mock('../../helpers');
beforeEach(() => {
  callerIdItemViewModel = undefined;
});

describe('CallerIdItemViewModel', () => {
  describe('isTwoLine', () => {
    it('Should return `true` for non-block type', () => {
      callerIdItemViewModel = new CallerIdItemViewModel({
        label: 'Main Company Number',
        onClick: () => {},
        phoneNumber: '+18002076138',
        selected: true,
        usageType: 'MainCompanyNumber',
        value: '+18002076138',
      });

      expect(callerIdItemViewModel.isTwoLine).toBeTruthy();
    });

    it('Should return `false` for block type', () => {
      callerIdItemViewModel = new CallerIdItemViewModel({
        label: 'Main Company Number',
        onClick: () => {},
        phoneNumber: '+18002076138',
        selected: true,
        usageType: 'Blocked',
        value: '+18002076138',
      });

      expect(callerIdItemViewModel.isTwoLine).toBeFalsy();
    });
  });

  describe('formattedPhoneNumber', () => {
    it('Should call `formatPhoneNumber` if mounted', () => {
      callerIdItemViewModel = new CallerIdItemViewModel({
        label: 'Main Company Number',
        onClick: () => {},
        phoneNumber: '+18002076138',
        selected: true,
        usageType: 'MainCompanyNumber',
        value: '+18002076138',
      });
      callerIdItemViewModel.formattedPhoneNumber;

      expect(formatPhoneNumber).toBeCalled();
    });
  });
});
