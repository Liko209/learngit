import { ENTITY_NAME } from '@/store/constants';
import * as utils from '@/store/utils';
import * as Segment from 'load-segment';
import { analytics } from '../Analytics';
import * as mobx from 'mobx';
jest.mock('@/store/utils');
jest.mock('load-segment');
jest.doMock('mobx');

describe('Analytics', () => {
  const mockedSegment = {
    identify: jest.fn(),
  };
  beforeEach(() => {
    const mockedReturnData = {
      [ENTITY_NAME.PERSON]: {
        email: 99,
        companyId: 1,
        inviterId: 2,
      },
      [ENTITY_NAME.COMPANY]: {
        name: 1,
        rcAccountId: 2,
      },
    };
    jest
      .spyOn(utils, 'getEntity')
      .mockImplementation(
        (entityName: ENTITY_NAME) => mockedReturnData[entityName],
      );
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(100);

    jest.spyOn(Segment, 'default').mockReturnValue(mockedSegment);
    jest.spyOn(mobx, 'reaction').mockImplementation((compute, reaction) => {
      reaction(compute());
      return jest.fn();
    });
  });
  it('should bootstrap segment', () => {
    analytics.bootstrap();
    expect(Segment.default).toBeCalled();
  });
  it('should identify the current user', () => {
    analytics.bootstrap();
    analytics.identify();
    expect(Segment.default).toBeCalled();
    expect(mockedSegment.identify).toBeCalledWith(100, {
      accountType: 'rc',
      companyId: 1,
      companyName: 1,
      email: 99,
      id: 100,
      rcAccountId: 2,
      signupType: 'viral',
    });
  });
});
