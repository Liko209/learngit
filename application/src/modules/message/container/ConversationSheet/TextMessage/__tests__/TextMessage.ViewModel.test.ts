/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { TextMessageViewModel } from '../TextMessage.ViewModel';

jest.mock('@/store/utils');

// const GROUP_ID = 52994050;
// const TEAM_ID = 11370502;
// const PERSON_ID = 2514947;

const mockPostData = {
  text: 'Post text',
  atMentionNonItemIds: [11370502],
};

const mockGroupData = {
  displayName: 'Team name',
};

const mockPersonData = {
  userDisplayName: 'Person name',
};

const mockMap = {
  [ENTITY_NAME.POST]: mockPostData,
  [ENTITY_NAME.GROUP]: mockGroupData,
  [ENTITY_NAME.PERSON]: mockPersonData,
};

let vm: TextMessageViewModel;

describe('TextMessageViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    vm = new TextMessageViewModel();
    jest.spyOn(vm, 'getGroup');
    jest.spyOn(vm, 'getPerson');
  });

  describe('html', () => {
    it('should be get url format text when text has link', () => {
      mockPostData.text = 'https://www.baidu.com';
      expect(vm.html).toBe(
        "<a href='https://www.baidu.com' target='_blank' rel='noreferrer'>https://www.baidu.com</a>",
      );
    });

    it('should be get email format text when text has email', () => {
      mockPostData.text = 'xxx@163.com';
      expect(vm.html).toBe(
        "<a href='mailto:xxx@163.com' target='_blank' rel='noreferrer'>xxx@163.com</a>",
      );
    });

    it('should be get bold font format text when there are two asterisks before and after', () => {
      mockPostData.text = '**awesome**';
      expect(vm.html).toBe('<b>awesome</b>');
    });
  });

  describe('at mentions for person', () => {
    const atMentionNonItemIds = [2514947];
    const text =
      "<a class='at_mention_compose' rel='{\"id\":2514947}'>@Thomas Yang</a>";

    it('should be get person name link when at mention a person', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(vm.html).toBe(
        `<button class='at_mention_compose' id='2514947'>${
          mockPersonData.userDisplayName
        }</button>`,
      );
      expect(vm.getGroup).toHaveBeenCalledTimes(0);
      expect(vm.getPerson).toHaveBeenCalledTimes(1);
    });

    it('should be get new person name link when person name be changed', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      mockPersonData.userDisplayName = 'New person name';
      expect(vm.html).toBe(
        `<button class='at_mention_compose' id='2514947'>${
          mockPersonData.userDisplayName
        }</button>`,
      );
    });
  });

  describe('at mentions for team', () => {
    const atMentionNonItemIds = [11370502];
    const text =
      "<a class='at_mention_compose' rel='{\"id\":11370502}'>@Jupiter profile mini card</a>";

    it('should be get team name link when at mention a team', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(vm.html).toBe(
        `<button class='at_mention_compose' id='11370502'>${
          mockGroupData.displayName
        }</button>`,
      );
      expect(vm.getGroup).toHaveBeenCalledTimes(1);
      expect(vm.getPerson).toHaveBeenCalledTimes(0);
    });

    it('should be get new team name link when team name be changed', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      mockGroupData.displayName = 'New team name';
      expect(vm.html).toBe(
        `<button class='at_mention_compose' id='11370502'>${
          mockGroupData.displayName
        }</button>`,
      );
    });
  });

  describe('at mentions for unknown item (not a team/person)', () => {
    const atMentionNonItemIds = [123];
    const originalText = 'Jupiter profile mini card';
    const text = `<a class='at_mention_compose' rel='{"id":123}'>@${originalText}</a>`;

    it('should be get original text when at mention an unknown item', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(vm.html).toBe(
        `<button class='at_mention_compose' id='123'>${originalText}</button>`,
      );
      expect(vm.getGroup).toHaveBeenCalledTimes(0);
      expect(vm.getPerson).toHaveBeenCalledTimes(0);
    });
  });
});
