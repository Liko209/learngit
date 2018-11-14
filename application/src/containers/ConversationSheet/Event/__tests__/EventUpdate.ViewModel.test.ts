/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-14 19:56:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { EventUpdateViewModel } from '../EventUpdate.ViewModel';

jest.mock('../../../../store/utils');

const mockData = {};

const taskUpdateViewModel = new EventUpdateViewModel({ ids: [1], postId: 2 });

describe('Task update item', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed _id', () => {
    expect(taskUpdateViewModel._id).toEqual(1);
  });

  it('computed _postId', () => {
    expect(taskUpdateViewModel._postId).toEqual(2);
  });

  it('computed post', () => {
    expect(taskUpdateViewModel.post).toBe(mockData);
  });

  it('computed event', () => {
    expect(taskUpdateViewModel.event).toBe(mockData);
  });
});
