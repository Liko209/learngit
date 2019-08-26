/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-19 23:36:19
 * Copyright © RingCentral. All rights reserved.
 */
import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ConferenceViewModel } from '../Conference.ViewModel';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import * as telephony from '@/modules/telephony/module.config';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TelephonyService } from '@/modules/telephony/service/TelephonyService';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import * as media from '@/modules/media/module.config';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/modules/common/container/PhoneNumberFormat');
jest.mock('sdk/module/config');
jest.mock('@/store/utils');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(media.config);

decorate(injectable(), FeaturesFlagsService);
container.bind(FeaturesFlagsService).to(FeaturesFlagsService);

const mockData = {
  creatorId: 101,
  rcData: {
    phoneNumber: '+44 650-123-641',
    hostCode: '123123',
    participantCode: '456456',
  },
};
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 101,
};

let viewModel: any;

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue({});
  viewModel = new ConferenceViewModel({ ids: [1] });
});

describe('Conference View Model', () => {
  beforeEach(() => {
    (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
      return mockGlobalValue[key];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('globalNumber', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(viewModel.globalNumber).toEqual('https://ringcentr.al/2L14jqL');
  });

  it('isHostByMe should be true when item creator is myself [JPT-963]', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(viewModel.isHostByMe).toBeTruthy();
  });

  it('isHostByMe should be false when item creator is not myself [JPT-963]', () => {
    (getEntity as jest.Mock).mockReturnValue({ ...mockData, creatorId: 102 });
    expect(viewModel.isHostByMe).toBeFalsy();
  });
  it('should return formatted phone number while call formatPhoneNumber', () => {
    const phoneNumber = '650-123-641';
    formatPhoneNumber.mockImplementationOnce(() => {
      return phoneNumber;
    });
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(viewModel.phoneNumber).toEqual(phoneNumber);
  });

  it.only('Should NOT show [Join] button and link if login user has no WebRTC permission', () => {
    expect(viewModel.canUseConference.cached.value).toEqual(false);
  });
});
