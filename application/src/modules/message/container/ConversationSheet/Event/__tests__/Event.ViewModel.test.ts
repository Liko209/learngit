/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 09:43:22
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { EventViewModel } from '../Event.ViewModel';

jest.mock('@/store/utils');

const mockData = {};

const eventViewModel = new EventViewModel({ ids: [1] });

describe('eventViewModel', () => {
  it('computed _id', () => {
    expect(eventViewModel._id).toEqual(1);
  });

  it('computed event', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(eventViewModel.event).toBe(mockData);
  });
});
