/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { ENTITY_NAME } from '@/store';
import { TextMessageViewModel } from '../TextMessage.ViewModel';

jest.mock('../../../../store/utils');

const mockPostData = {
  text: 'Post text',
  atMentionNonItemIds: [1],
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
});
