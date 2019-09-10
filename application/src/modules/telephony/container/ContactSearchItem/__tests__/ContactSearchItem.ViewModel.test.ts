/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-03 18:32:59
 * Copyright © RingCentral. All rights reserved.
 */

import { ContactSearchItemViewModel } from '../ContactSearchItem.ViewModel';
import { getEntity } from '@/store/utils';
import { v4 } from 'uuid';
import { ENTITY_NAME } from '@/store';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());

jest.mock('@/store/utils', () => {
  const mockedUtils = {
    getEntity: jest.fn(),
  };
  return mockedUtils;
});

jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

const personID = +new Date();
const email = 'user20474@jupitertest523.ru';
const formattedPhoneNumber = '20474';

getEntity.mockImplementation(entityName => {
  switch (entityName) {
    case ENTITY_NAME.PHONE_NUMBER:
      return {
        id: formattedPhoneNumber,
        isMocked: false,
        _formattedPhoneNumber: formattedPhoneNumber,
      };
    case ENTITY_NAME.PERSON:
      return {
        id: personID,
        isMocked: true,
        companyId: 401409,
        firstName: 'Malachi',
        lastName: 'Fadel',
        email,
        rcPhoneNumbers: [
          {
            id: 400701118008,
            phoneNumber: '+18002076138',
            usageType: 'MainCompanyNumber',
          },
        ],
        sanitizedRcExtension: { extensionNumber: '20474', type: 'User' },
        flags: 12,
      };
    default:
      return {};
  }
});

let contactSearchItemViewModel: ContactSearchItemViewModel;

const directDial = v4();

beforeAll(() => {
  contactSearchItemViewModel = new ContactSearchItemViewModel({
    phoneId: v4(),
    personId: +new Date(),
    directDial,
    selected: false,
    onClick: jest.fn(),
    itemIndex: 1,
  });
  contactSearchItemViewModel.onAfterMount();
});

describe('ContactSearchItemViewModel', () => {
  it('should call getEntity()', () => {
    expect(getEntity).toHaveBeenCalledTimes(3);
  });

  it('should have direct dial', () => {
    expect(contactSearchItemViewModel.phoneNumber).toEqual(directDial);
  });

  it('should show showDialIcon', () => {
    expect(contactSearchItemViewModel.showDialIcon).toBeTruthy();
  });

  it(`should display phone number: ${directDial}`, () => {
    expect(contactSearchItemViewModel.phoneNumber).toBe(directDial);
  });

  it(`should return uid:${personID}`, () => {
    expect(contactSearchItemViewModel.uid).toBe(personID);
  });

  it(`should display name as ${email}`, () => {
    expect(contactSearchItemViewModel.name).toBe(email);
  });

  it(`should not be extension`, () => {
    expect(contactSearchItemViewModel.isExt).toBeFalsy();
  });
});
