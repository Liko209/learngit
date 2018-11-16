/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 10:10:26
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { TaskViewModel } from '../Task.ViewModel';

jest.mock('../../../../store/utils');

const mockData = {
  attachmentIds: [123],
};

const taskViewModel = new TaskViewModel({ ids: [1] });

describe('taskUpdateViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed attachmentIds', () => {
    expect(taskViewModel.attachmentIds).toEqual([123]);
  });

  it('computed task', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(taskViewModel.task).toBe(mockData);
  });
});
