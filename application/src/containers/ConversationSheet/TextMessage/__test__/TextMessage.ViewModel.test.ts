/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { TextMessageViewModel } from '../TextMessage.ViewModel';

jest.mock('../../../../store/utils');
const TextMessageVM = new TextMessageViewModel();

const mockPostEntity = (text: string) => {
  (getEntity as jest.Mock).mockReturnValue({
    text,
    atMentionNonItemIds: [1234],
  });
};
describe('TextMessage', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  describe('formatHtml', () => {
    it('url', () => {
      mockPostEntity('https://www.baidu.com');
      expect(TextMessageVM.html).toBe(
        "<a href='https://www.baidu.com' target='_blank' rel='noreferrer'>https://www.baidu.com</a>",
      );
    });
    it('email', () => {
      mockPostEntity('xxx@163.com');
      expect(TextMessageVM.html).toBe(
        "<a href='mailto:xxx@163.com' target='_blank' rel='noreferrer'>xxx@163.com</a>",
      );
    });
    it('bold font', () => {
      mockPostEntity('**awesome**');
      expect(TextMessageVM.html).toBe('<b>awesome</b>');
    });
  });
});
