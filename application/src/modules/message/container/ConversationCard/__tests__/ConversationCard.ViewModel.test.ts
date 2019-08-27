/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:39:43
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity, mockGlobalValue } from 'shield/application';
import { TypeDictionary } from 'sdk/utils';
import { ENTITY_NAME } from '@/store';
import { ConversationCardViewModel } from '../ConversationCard.ViewModel';

jest.mock('emoji-mart', () => ({
  getEmojiDataFromNative: () => ({
    colons: ':rainbow:',
  }),
}));
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
    @test('should return post if entity has value')
    @mockEntity(mockPostValue)
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.post).toMatchObject({
        ...mockPostValue,
      });
    }
  }
  @testable
  class colonsEmoji {
    @test('should return colon emoji when get awayStatus')
    @mockEntity({
      awayStatus: ":rainbow:"
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.colonsEmoji).toBe(':rainbow:')
    }
  }
  @testable
  class statusPlainText {
    @test('should return colon emoji when get awayStatus')
    @mockEntity({
      awayStatus: ":rainbow: hello world"
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.statusPlainText).toBe('  ')
    }
  }

  @testable
  class creator {
    @test('should return creator if has creatorId')
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
      expect(await conversationCardVM.createTime).toBe('Fri, 1/4/2019 9:21 AM');
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
      expect(await conversationCardVM.createTime).toBe('9:21 AM');
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
      expect(await conversationCardVM.createTime).toBe('Thu, 9:21 AM');
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
      expect(await conversationCardVM.createTime).toBe('Sat, 1/5/2019 9:21 AM');
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
      expect(await conversationCardVM.createTime).toBe(expected);
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
      expect(await conversationCardVM.createTime).not.toBe(expected);
    }
  }

  @testable
  class isArchivedGroup {
    @test('should be true if isArchived is true')
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
    @test('should be false when no activity')
    @mockEntity({
      activityData: null,
    })
    t1() {
      const conversationCardVM = new ConversationCardViewModel();
      expect(conversationCardVM.hideText).toBeFalsy();
    }

    @test('should be true when activity have object_id or key')
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
    @test('should return itemTypeIds if entity has value')
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
    @test('should be true or false if value [1] or [2]')
    @mockGlobalValue.multi([[1], [2]])
    t1() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });
      expect(conversationCardVM.isEditMode).toBe(true);
      expect(conversationCardVM.isEditMode).toBe(false);
    }
  }

  const repliedEntityMock = (typeId?: TypeDictionary, parentId?: number) => (
    name: any,
  ) => {
    if (name === ENTITY_NAME.POST) {
      return { parentId };
    }

    if ((name = ENTITY_NAME.ITEM)) {
      return { typeId };
    }
  };

  @testable
  class repliedEntity {
    @test('should not show replied entity when not parent id. [JPT-2571]')
    @mockEntity(repliedEntityMock())
    t1() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toBe(null);
    }

    @test('should show task replied when replied to a task. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_TASK, 1))
    t2() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'task_incomplete',
      });
    }

    @test('should show event replied when replied to a event. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_EVENT, 1))
    t3() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'event',
      });
    }

    @test('should show code replied when replied to a code. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_CODE, 1))
    t4() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'code',
      });
    }

    @test('should show link replied when replied to a link. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_LINK, 1))
    t5() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'link',
      });
    }

    @test('should show file replied when replied to a file. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_FILE, 1))
    t6() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'attachment',
      });
    }

    @test('should show note replied when replied to a note. [JPT-2571]')
    @mockEntity(repliedEntityMock(TypeDictionary.TYPE_ID_PAGE, 1))
    t7() {
      const conversationCardVM = new ConversationCardViewModel({ id: 1 });

      expect(conversationCardVM.repliedEntity).toMatchObject({
        iconName: 'notes',
      });
    }
  }
});
