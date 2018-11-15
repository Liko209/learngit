/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-14 19:10:42
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { TaskUpdateViewModel } from '../TaskUpdate.ViewModel';

jest.mock('../../../../store/utils');

const mockData = {};

const taskUpdateViewModel = new TaskUpdateViewModel({ ids: [1], postId: 2 });

describe('Task update item', () => {
  it('computed _id', () => {
    expect(taskUpdateViewModel._id).toEqual(1);
  });

  it('computed _postId', () => {
    expect(taskUpdateViewModel._postId).toEqual(2);
  });

  it('computed post', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(taskUpdateViewModel.post).toBe(mockData);
  });

  it('computed task', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(taskUpdateViewModel.task).toBe(mockData);
  });
});
