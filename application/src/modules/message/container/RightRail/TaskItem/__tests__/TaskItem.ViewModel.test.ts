/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-16 10:47:57
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '../../../../../../store';
import { getEntity } from '@/store/utils';
import { TaskItemViewModel } from '../TaskItem.ViewModel';

jest.mock('@/store/utils');

const taskItemViewModel = new TaskItemViewModel();

const mockPersonReturnValue = {
  userDisplayName: 'name',
};
const mockTaskReturnValue: any = {
  assignedToIds: [1, 2],
  complete: false,
  due: 1547086968632,
};

describe('taskItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('get task [JPT-960]', () => {
    (getEntity as jest.Mock).mockReturnValue(mockTaskReturnValue);
    expect(taskItemViewModel.task).toEqual(mockTaskReturnValue);
    const newTask = Object.assign({}, mockTaskReturnValue, {
      complete: true,
    });
    (getEntity as jest.Mock).mockReturnValue(newTask);
    expect(taskItemViewModel.task).toEqual(newTask);
  });
  it('get personName [JPT-852]', () => {
    (getEntity as jest.Mock).mockReturnValue({});
    expect(taskItemViewModel.personName).toBe('');
    (getEntity as jest.Mock).mockImplementation((key: string) => {
      if (key === ENTITY_NAME.PERSON) {
        return mockPersonReturnValue;
      }
      return mockTaskReturnValue;
    });

    expect(taskItemViewModel.personName).toBe('name, name');
  });

  it('get dueTime [JPT-852]', () => {
    (getEntity as jest.Mock).mockReturnValue(mockTaskReturnValue);

    expect(taskItemViewModel.dueTime).toBe('1/10/2019');
    (getEntity as jest.Mock).mockReturnValue({
      due: '',
    });

    expect(taskItemViewModel.dueTime).toBe('');

    (getEntity as jest.Mock).mockReturnValue({
      due: 1547631484105,
    });

    expect(taskItemViewModel.dueTime).toBe('1/16/2019');
  });
});
