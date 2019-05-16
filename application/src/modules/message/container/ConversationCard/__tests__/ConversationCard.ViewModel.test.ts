/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:39:43
 * Copyright © RingCentral. All rights reserved.
 */
import { test, mockEntity, testable, mockGlobalValue } from 'shield';
import { registerModule } from 'shield/utils';
import { config } from '@/modules/GlobalSearch/module.config';
import { ConversationCardViewModel } from '../ConversationCard.ViewModel';

jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

registerModule(config);

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = DATE_2019_1_4 - DAY;
const DATE_2019_1_2 = DATE_2019_1_4 - 2 * DAY;
const DATE_2019_1_1 = DATE_2019_1_4 - 3 * DAY;
const DATE_2018_12_30 = DATE_2019_1_4 - 5 * DAY;
const DATE_2018_12_29 = DATE_2019_1_4 - 6 * DAY;
const DATE_2018_12_28 = DATE_2019_1_4 - 7 * DAY;
const DATE_2019_1_5 = DATE_2019_1_4 + DAY;

describe('TestConversationCardViewModel', () => {
  const mockPostValue = {
    atMentionNonItemIds: [1234],
    text: 'abcd  efg',
  };

  @testable
  class post {
    @test('get post')
    @mockEntity(mockPostValue)
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.post).toMatchObject({
        ...mockPostValue,
      });
    }
  }

  @testable
  class creator {
    @test('get creator')
    @mockEntity({
      createdAt: 1540279718268,
      creatorId: 107913219,
      id: 1491222532,
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.creator).toMatchObject({
        id: 1491222532,
      });
    }
  }

  @testable
  class createTime {
    @test('should be timeAndDate format when mode is navigation [JPT-705]')
    @mockEntity({
      createdAt: DATE_2019_1_4,
      creatorId: 107913219,
    })
    async t1(done: jest.DoneCallback) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      conversationCardVM.props.mode = 'navigation';
      expect(await conversationCardVM.createTime.fetch()).toBe(
        'Fri, 1/4/2019 9:21 AM',
      );
      conversationCardVM.props.mode = undefined;
      done();
    }

    @test('should be time format when createdAt is 2019/1/4 [JPT-701]')
    @mockEntity({
      createdAt: DATE_2019_1_4,
      creatorId: 107913219,
    })
    async t2(done: jest.DoneCallback) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).toBe('9:21 AM');
      done();
    }

    @test(
      'should be weekdayAndTime format when createdAt is 2019/1/3 [JPT-701]',
    )
    @mockEntity({
      createdAt: DATE_2019_1_3,
      creatorId: 107913219,
    })
    async t3(done: jest.DoneCallback) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).toBe('Thu, 9:21 AM');
      done();
    }

    @test('should be dateAndTime format when createdAt is 2019/1/5 [JPT-701]')
    @mockEntity({
      createdAt: DATE_2019_1_5,
      creatorId: 107913219,
    })
    async t4(done: jest.DoneCallback) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).toBe(
        'Sat, 1/5/2019 9:21 AM',
      );
      done();
    }

    @(test.each`
      data               | expected
      ${DATE_2019_1_3}   | ${'Thu, 9:21 AM'}
      ${DATE_2019_1_2}   | ${'Wed, 9:21 AM'}
      ${DATE_2018_12_30} | ${'Sun, 9:21 AM'}
      ${DATE_2018_12_29} | ${'Sat, 9:21 AM'}
    `('should be Weekday format when createdAt is $data. [JPT-701]'))
    @mockEntity(({ data }) => ({
      createdAt: data,
      creatorId: 107913219,
    }))
    async t5({ expected }) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).toBe(expected);
    }

    @(test.each`
      data               | expected
      ${DATE_2019_1_1}   | ${'Mon, 9:21 AM'}
      ${DATE_2018_12_28} | ${'Fri, 9:21 AM'}
    `('should not Weekday format when createdAt is $data. [JPT-701]'))
    @mockEntity(({ data }) => ({
      createdAt: data,
      creatorId: 107913219,
    }))
    async t6({ expected }) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).not.toBe(expected);
    }
  }

  @testable
  class isArchivedGroup {
    @test('isArchived()')
    @mockEntity({
      isArchived: true,
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.isArchivedGroup).toBe(true);
    }
  }

  @testable
  class showToast {
    @test('should return false if isArchived is false')
    @mockEntity({
      isArchived: false,
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.showToast).toBe(false);
    }

    @test('should return true if isArchived is true')
    @mockEntity({
      isArchived: true,
    })
    t2() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.showToast).toBe(true);
    }
  }

  @testable
  class hideText {
    @test('should hideText be false when no activity')
    @mockEntity({
      activityData: null,
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.hideText).toBeFalsy();
    }

    @test('should hideText be true when activity have object_id or key')
    @mockEntity.multi([
      {
        activityData: { object_id: 1 },
      },
      {
        activityData: { key: 1 },
      },
    ])
    t2() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.hideText).toBeTruthy();
    }
  }

  @testable
  class itemTypeIds {
    @test('should return itemTypeIds')
    @mockEntity({
      itemTypeIds: [1],
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.itemTypeIds).toEqual([1]);
    }
  }

  @testable
  class isEditMode {
    @test('if value [1] should be true or [2] should be false')
    @mockGlobalValue.multi([[1], [2]])
    t1() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });
      expect(conversationCardVM.isEditMode).toBe(true);
      expect(conversationCardVM.isEditMode).toBe(false);
    }
  }
});
