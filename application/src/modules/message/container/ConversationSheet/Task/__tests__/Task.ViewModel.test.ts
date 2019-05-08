/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 10:10:26
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { TaskViewModel } from '../Task.ViewModel';
import * as date from '../../../../../../utils/date';
jest.mock('@/store/utils');
jest.mock('../../helper');
jest.mock('@/utils/date');

const mockData = {
  attachmentIds: [123],
};

const taskViewModel = new TaskViewModel({
  postId: 1,
  ids: [1],
});

describe('taskUpdateViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('computed attachmentIds', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(taskViewModel.attachmentIds).toEqual([123]);
  });

  it('computed task', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(taskViewModel.task).toBe(mockData);
  });

  it('Should be false if not start or due', () => {
    (getEntity as jest.Mock).mockReturnValue({
      start: null,
      due: null,
    });
    expect(taskViewModel.hasTime).toBeFalsy();
    (getEntity as jest.Mock).mockReturnValue({
      start: 123123,
      due: null,
    });
    expect(taskViewModel.hasTime).toBeFalsy();
    (getEntity as jest.Mock).mockReturnValue({
      start: null,
      due: 123123,
    });
    expect(taskViewModel.hasTime).toBeFalsy();
  });

  it('Should be true if start and due existed', () => {
    (getEntity as jest.Mock).mockReturnValue({
      start: 123123,
      due: 123123,
    });
    expect(taskViewModel.hasTime).toBeTruthy();
  });

  it('Should be empty string if start not existed', async (done: jest.DoneCallback) => {
    (getEntity as jest.Mock).mockReturnValue({
      start: null,
    });
    expect(await taskViewModel.startTime.fetch()).toBe('');
    done();
  });
  it('Should be date if start existed', async (done: jest.DoneCallback) => {
    (getEntity as jest.Mock).mockReturnValue({
      start: 1547003419176,
    });
    jest.spyOn(date, 'recentlyTwoDayAndOther').mockReturnValue('Mon 8:58 AM');
    expect(await taskViewModel.startTime.fetch()).not.toBe('');
    done();
  });

  it('Should be empty string if due not existed', async (done: jest.DoneCallback) => {
    (getEntity as jest.Mock).mockReturnValue({
      due: null,
    });
    expect(await taskViewModel.endTime.fetch()).toBe('');
    done();
  });

  it('Should be date if due existed', async (done: jest.DoneCallback) => {
    (getEntity as jest.Mock).mockReturnValue({
      due: 1547003419176,
    });
    expect(await taskViewModel.endTime.fetch()).not.toBe('');
    done();
  });
});
