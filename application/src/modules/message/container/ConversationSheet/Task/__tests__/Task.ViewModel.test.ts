/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 10:10:26
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../../store/utils';
import { TaskViewModel } from '../Task.ViewModel';
import * as date from '../../../../../../utils/date';
import { getDateAndTime } from '../../helper';
jest.mock('../../../../store/utils');
jest.mock('../../helper');
jest.mock('../../../../utils/date');

const mockData = {
  attachmentIds: [123],
};

const taskViewModel = new TaskViewModel({ ids: [1] });

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

  it('Should be empty string if start not existed', () => {
    (getEntity as jest.Mock).mockReturnValue({
      start: null,
    });
    expect(taskViewModel.startTime).toBe('');
  });
  it('Should be date if start existed', () => {
    (getEntity as jest.Mock).mockReturnValue({
      start: 1547003419176,
    });
    jest.spyOn(date, 'recentlyTwoDayAndOther').mockReturnValue('Mon 8:58 AM');
    expect(taskViewModel.startTime).not.toBe('');
  });

  it('Should be empty string if due not existed', () => {
    (getEntity as jest.Mock).mockReturnValue({
      due: null,
    });
    expect(taskViewModel.endTime).toBe('');
  });
  it('Should be date if due existed', () => {
    (getEntity as jest.Mock).mockReturnValue({
      due: 1547003419176,
    });
    expect(taskViewModel.endTime).not.toBe('');
  });
});
