/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-14 19:56:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../../store/utils';
import { EventUpdateViewModel } from '../EventUpdate.ViewModel';

jest.mock('../../../../store/utils');

const mockData = {};

const eventUpdateViewModel = new EventUpdateViewModel({ ids: [1], postId: 2 });

describe('eventUpdateViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('computed _id', () => {
    expect(eventUpdateViewModel._id).toEqual(1);
  });

  it('computed _postId', () => {
    expect(eventUpdateViewModel._postId).toEqual(2);
  });

  it('computed post', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(eventUpdateViewModel.post).toBe(mockData);
  });

  it('computed event', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(eventUpdateViewModel.event).toBe(mockData);
  });

  it('computed oldTimeText', () => {
    jest.spyOn(eventUpdateViewModel, 'getTimeText').mockReturnValue('');
    expect(eventUpdateViewModel.oldTimeText).toBe('');
  });

  it('computed newTimeText', () => {
    jest.spyOn(eventUpdateViewModel, 'getTimeText').mockReturnValue('text');
    expect(eventUpdateViewModel.newTimeText).toBe('text');
  });
});
