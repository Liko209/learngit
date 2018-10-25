/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { FormatMessagesViewModel } from '../FormatMessages.ViewModel';

jest.mock('../../../store/utils');
const formatMessagesVM = new FormatMessagesViewModel();

const mockPostEntity = (text) => {
  (getEntity as jest.Mock).mockReturnValue({
    text,
    atMentionNonItemIds: [1234],
  });
}
describe('FormatMessages', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  describe('formatHtml', () => {
    it('url', () => {
      mockPostEntity('https://www.baidu.com');
      expect(formatMessagesVM.formatHtml).toBe("<a href='https://www.baidu.com' target='_blank' rel='noreferrer'>https://www.baidu.com</a>");
    });
    it('email', () => {
      mockPostEntity('xxx@163.com');
      expect(formatMessagesVM.formatHtml).toBe("<a href='mailto:xxx@163.com' target='_blank' rel='noreferrer'>xxx@163.com</a>");
    });
    it('bold font', () => {
      mockPostEntity('**awesome**');
      expect(formatMessagesVM.formatHtml).toBe('<b>awesome</b>');
    });
  });
});
