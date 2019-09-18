import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ContactSearchListViewModel } from '../ContactSearchList.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { getEntity } from '@/store/utils';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
jest.mock('@/store/utils');

const searchService = {
  doFuzzySearchPhoneContacts: jest.fn().mockReturnValue(null),
};

const sleep = async () =>
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });
jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(conf => {
  switch (conf) {
    case ServiceConfig.SEARCH_SERVICE:
      return searchService;
    case ServiceConfig.PHONE_NUMBER_SERVICE:
      return {
        isValidNumber: jest.fn().mockImplementation(toNumber => ({
          isValid: true,
          toNumber,
          parsed: toNumber,
        })),
        getLocalCanonical: jest.fn().mockImplementation(i => i),
      };
    default:
      return {};
  }
});

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let contactSearchListViewModel: ContactSearchListViewModel;

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue({});
  const mockedFn = jest.fn();

  contactSearchListViewModel = new ContactSearchListViewModel({
    onContactSelected: jest.fn(),
    inputStringProps: 'inputString',
  });
  contactSearchListViewModel._telephonyService.directCall = jest.fn();
  contactSearchListViewModel.props.onContactSelected = (args: any) =>
    contactSearchListViewModel._telephonyService.directCall(args);
});

afterEach(() => {
  searchService.doFuzzySearchPhoneContacts = jest.fn().mockReturnValue(null);
  contactSearchListViewModel._telephonyStore.inputString = '';
});

describe('contactSearchListViewModel', () => {
  it('Can display an extra entry above the result list when the search keyword is a valid phone number [JPT-2217]', async () => {
    const searchString = '123';
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    await sleep();
    expect(contactSearchListViewModel.displayedSearchResult.length).toBe(1);
    const firstRes = contactSearchListViewModel.displayedSearchResult[0];

    expect(firstRes.directDial).toEqual(searchString);
  });

  it('Can update matched records constantly after editing the search keyword [JPT-2255]', async () => {
    let searchString = '44';
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    await sleep();
    searchString = '445';
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    await sleep();
    const searchService = ServiceLoader.getInstance(
      ServiceConfig.SEARCH_SERVICE,
    );
    expect(searchService.doFuzzySearchPhoneContacts).toBeCalledTimes(2);
  });

  it('should initial with empty', async () => {
    await contactSearchListViewModel.loadInitialData();
    expect(contactSearchListViewModel.displayIdx).toBe(0);
    expect(contactSearchListViewModel.hasMore()).toBeFalsy();
  });

  it('should not change the search result when scrolling upwards', () => {
    const oldFunc = contactSearchListViewModel._getIdx;
    contactSearchListViewModel._getIdx = jest.fn();

    contactSearchListViewModel.loadMore('up', 10);
    expect(contactSearchListViewModel._getIdx).not.toBeCalled();

    contactSearchListViewModel._getIdx = oldFunc;
  });

  it('should change the search result when scrolling downwards', () => {
    const oldFunc = contactSearchListViewModel._getIdx;
    contactSearchListViewModel._getIdx = jest.fn();

    contactSearchListViewModel.loadMore('down', 10);
    expect(contactSearchListViewModel._getIdx).toBeCalled();

    contactSearchListViewModel._getIdx = oldFunc;
  });

  it('should not make the call whenever hit the enter key even with empty results while dialer not focused', async () => {
    const searchString = '456';
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    contactSearchListViewModel._telephonyStore.dialerInputFocused = false;
    contactSearchListViewModel._telephonyService.directCall = jest.fn();

    await sleep();

    contactSearchListViewModel.onEnter();
    expect(
      contactSearchListViewModel._telephonyService.directCall,
    ).not.toBeCalledWith(searchString);
  });

  it('should make the call whenever hit the enter key even with empty results while dialer being focused', async () => {
    const searchString = '123';
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    contactSearchListViewModel._telephonyStore.dialerInputFocused = true;
    contactSearchListViewModel._telephonyService.directCall = jest.fn();

    await sleep();

    contactSearchListViewModel.onEnter();
    expect(
      contactSearchListViewModel._telephonyService.directCall,
    ).toBeCalledWith(searchString);
  });

  it('should not change the index when initialized with empty array', () => {
    contactSearchListViewModel.increaseFocusIndex();
    expect(contactSearchListViewModel.displayIdx).toBe(0);
    contactSearchListViewModel.decreaseFocusIndex();
    expect(contactSearchListViewModel.displayIdx).toBe(0);
  });

  it('should have 3 search result', async () => {
    const searchString = '123';
    const phoneContacts = [
      {
        phoneNumber: { id: '+13479470001', phoneNumberType: 'DirectNumber' },
        id: '193134595.+13479470001',
        person: {
          creator_id: 193134595,
          created_at: 1558920976345,
          version: 101109404270592,
          email: 'user888@jupitertest523.ru',
          first_name: 'Ken1',
          last_name: 'Li',
          company_id: 401409,
          sanitized_rc_extension: { extensionNumber: '888', type: 'User' },
          rc_phone_numbers: [
            {
              id: 400701215008,
              phoneNumber: '+13479470001',
              usageType: 'DirectNumber',
            },
            {
              id: 400701216008,
              phoneNumber: '+13479470008',
              usageType: 'DirectNumber',
            },
            {
              id: 400701118008,
              phoneNumber: '+18002076138',
              usageType: 'MainCompanyNumber',
            },
          ],
          flags: 44,
          model_size: 2,
          id: 193134595,
        },
      },
      {
        phoneNumber: { id: '+13479470008', phoneNumberType: 'DirectNumber' },
        id: '193134595.+13479470008',
        person: {
          creator_id: 193134595,
          created_at: 1558920976345,
          version: 101109404270592,
          email: 'user888@jupitertest523.ru',
          first_name: 'Ken1',
          last_name: 'Li',
          company_id: 401409,
          sanitized_rc_extension: { extensionNumber: '888', type: 'User' },
          rc_phone_numbers: [
            {
              id: 400701215008,
              phoneNumber: '+13479470001',
              usageType: 'DirectNumber',
            },
            {
              id: 400701216008,
              phoneNumber: '+13479470008',
              usageType: 'DirectNumber',
            },
            {
              id: 400701118008,
              phoneNumber: '+18002076138',
              usageType: 'MainCompanyNumber',
            },
          ],
          flags: 44,
          model_size: 2,
          id: 193134595,
        },
      },
    ];
    searchService.doFuzzySearchPhoneContacts.mockReturnValue({
      phoneContacts,
      terms: [searchString],
    });
    contactSearchListViewModel._telephonyStore.inputString = searchString;
    await sleep();
    expect(contactSearchListViewModel.displayedSearchResult.length).toBe(3);
    expect(
      contactSearchListViewModel.displayedSearchResult.slice(1, 3),
    ).toEqual(phoneContacts);
    contactSearchListViewModel.loadInitialData();
    expect(contactSearchListViewModel.hasMore()).toBeFalsy();
  });

  describe('onClick()', () => {
    it('should set dialerInputFocus as true and set focusIndex correst',() => {
      contactSearchListViewModel.onClick(0);
      expect(contactSearchListViewModel._telephonyStore.dialerInputFocused).toBeTruthy();
      expect(contactSearchListViewModel.focusIndex).toBe(0);
    })
  })

  describe('selectCallItem()', () => {
    it('should cancel the selection of transfer user [JPT-2764]',() => {
      contactSearchListViewModel.selectCallItem('123', 1);
      expect(contactSearchListViewModel._telephonyStore.selectedCallItem).toEqual({
        phoneNumber: '123',
        index: 1,
      })
      contactSearchListViewModel.selectCallItem('123', 1);
      expect(contactSearchListViewModel._telephonyStore.selectedCallItem).toEqual({
        phoneNumber: '',
        index: NaN,
      })
    })
  })
});
