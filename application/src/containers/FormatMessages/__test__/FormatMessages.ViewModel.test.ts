/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../store/utils';
import { FormatMessagesViewModel } from '../FormatMessages.ViewModel';

jest.mock('../../../store/utils');
const formatMessagesVM = new FormatMessagesViewModel();

describe('FormatMessages', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('post()', () => {
    const mockPostValue = {
      atMentionNonItemIds: [1234],
      text: 'abcd  efg',
    };
    (getEntity as jest.Mock).mockReturnValue({
      ...mockPostValue,
    });
    expect(formatMessagesVM._post).toMatchObject({
      ...mockPostValue,
    });
  });
  it('atMentionIdMaps()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      atMentionNonItemIds: [1234],
      displayName: 'alvin huang',
    });
    expect(formatMessagesVM._atMentionIdMaps).toMatchObject({
      1234: 'alvin huang',
    });
  });
  it('currentUserId()', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(123456);
    expect(formatMessagesVM._currentUserId).toBe(123456);
  });
});
