/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-15 10:10:26
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { TaskViewModel } from '../Task.ViewModel';
import * as date from '../../../../../../utils/date';
jest.mock('@/store/utils');
jest.mock('../../helper');
jest.mock('@/utils/date');

const mockData = {
  attachmentIds: [123],
};

function getTextByLen(length: number) {
  return Array(length + 1).join('1');
}

describe('taskUpdateViewModel', () => {
  @testable
  class attachmentIds {
    @test('should be return attachmentIds when get attachmentIds')
    @mockEntity(mockData)
    t1() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.attachmentIds).toEqual([123]);
    }
  }

  @testable
  class task {
    @test('should be return task when get task')
    @mockEntity(mockData)
    t1() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.task).toBe(mockData);
    }
  }

  @testable
  class hasTime {
    @test('should be false if not start or due')
    @mockEntity.multi([
      {
        start: null,
        due: null,
      },
      {
        start: 123123,
        due: null,
      },
      {
        start: null,
        due: 123123,
      },
    ])
    t1() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.hasTime).toBeFalsy();
      expect(taskViewModel.hasTime).toBeFalsy();
      expect(taskViewModel.hasTime).toBeFalsy();
    }

    @test('should be true if start and due existed')
    @mockEntity({
      start: 123123,
      due: 123123,
    })
    t2() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.hasTime).toBeTruthy();
    }
  }

  @testable
  class startTime {
    @test('should be empty string if start not existed')
    @mockEntity({
      start: null,
    })
    async t1(done: jest.DoneCallback) {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(await taskViewModel.startTime.fetch()).toBe('');
      done();
    }

    @test('should be date if start existed')
    @mockEntity({
      start: 1547003419176,
    })
    async t2(done: jest.DoneCallback) {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      jest.spyOn(date, 'recentlyTwoDayAndOther').mockReturnValue('Mon 8:58 AM');
      expect(await taskViewModel.startTime.fetch()).not.toBe('');
      done();
    }
  }

  @testable
  class endTime {
    @test('should be empty string if due not existed')
    @mockEntity({
      due: null,
    })
    async t1(done: jest.DoneCallback) {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(await taskViewModel.endTime.fetch()).toBe('');
      done();
    }

    @test('should be date if start existed')
    @mockEntity({
      due: 1547003419176,
    })
    async t2(done: jest.DoneCallback) {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(await taskViewModel.endTime.fetch()).not.toBe('');
      done();
    }
  }

  @testable
  class notes {
    @test('should be truncated if char > 300 [JPT-357]')
    @mockEntity({
      notes: getTextByLen(301),
    })
    t1() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.notes.indexOf('...') > -1).toBeTruthy();
    }

    @test('should not truncated if char <= 300 [JPT-357]')
    @mockEntity.multi([
      {
        notes: getTextByLen(300),
      },
      {
        notes: getTextByLen(299),
      },
    ])
    t2() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.notes.indexOf('...') < 0).toBeTruthy();
      expect(taskViewModel.notes.indexOf('...') < 0).toBeTruthy();
    }
  }

  @testable
  class section {
    @test('should be truncated if char > 300 [JPT-357]')
    @mockEntity({
      section: getTextByLen(301),
    })
    t1() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.section.indexOf('...') > -1).toBeTruthy();
    }

    @test('should not truncated if char <= 300 [JPT-357]')
    @mockEntity.multi([
      {
        section: getTextByLen(300),
      },
      {
        section: getTextByLen(299),
      },
    ])
    t2() {
      const taskViewModel = new TaskViewModel({
        postId: 1,
        ids: [1],
      });
      expect(taskViewModel.section.indexOf('...') < 0).toBeTruthy();
      expect(taskViewModel.section.indexOf('...') < 0).toBeTruthy();
    }
  }
});
