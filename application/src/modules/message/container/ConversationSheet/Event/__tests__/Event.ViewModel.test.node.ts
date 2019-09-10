/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 09:43:22
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { EventViewModel } from '../Event.ViewModel';

jest.mock('@/store/utils');

const DATE_2019_1_4 = 1546564919703;
const mockData = {
  end: DATE_2019_1_4,
  repeat: 'none',
  repeatEnding: 'none',
  repeatEndingAfter: '1',
  repeatEndingOn: null,
  start: DATE_2019_1_4,
};

jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string, object: any) => {
    const args = object ? object.date : '';
    const time = object ? object.time : '';
    return args ? `${args} ${text} ${time}` : text;
  },
}));

const eventViewModel = new EventViewModel({ ids: [1] });

describe('eventViewModel', () => {
  it('computed _id', () => {
    expect(eventViewModel._id).toEqual(1);
  });

  it('computed event', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(eventViewModel.event).toBe(mockData);
  });

  describe('timeContent', () => {
    it('is all day', async (done: jest.DoneCallback) => {
      (getEntity as jest.Mock).mockReturnValue({
        ...mockData,
        allDay: false,
      });
      expect((await eventViewModel.timeContent.fetch()).trim()).toBe(
        'com, 1/4/2019 common.time.dateAtTime 9:21 AM - 9:21 AM',
      );
      done();
    });
    it('is all day', async (done: jest.DoneCallback) => {
      (getEntity as jest.Mock).mockReturnValue({
        ...mockData,
        allDay: true,
      });
      expect((await eventViewModel.timeContent.fetch()).trim()).toBe(
        'com, 1/4/2019',
      );
      done();
    });
  });
});
