/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-16 10:47:57
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { TaskItemViewModel } from '../TaskItem.ViewModel';

jest.mock('../../../../store/utils');

const taskItemViewModel = new TaskItemViewModel();

const mockPersonReturnValue = {
  userDisplayName: 'name',
};
const mockTaskReturnValue = {
  createdAt: 1547086968632,
};

describe('taskItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('get createdAt', () => {
    (getEntity as jest.Mock).mockReturnValue(mockTaskReturnValue);

    expect(taskItemViewModel.createdAt).toBe('1/10/2019');
  });
});
