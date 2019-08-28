/*
 * @Author: Alvin Huang
 * @Date: 2019-08-22 14:05:24
 * Copyright © RingCentral. All rights reserved.
 */
import { getColonsEmoji } from '../getSharedStatus';

jest.mock('emoji-mart', () => ({
  getEmojiDataFromNative: () => ({
    colons: ':sunflowers:',
  }),
}));
describe('getSharedStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should return correct emoji from given status', () => {
    const status = '🌻 hello world';
    expect(getColonsEmoji(status)).toBe(':sunflowers:');
  });
  it('should return single emoji from given status', () => {
    const status = '🌻:home: hello world';
    expect(getColonsEmoji(status)).toBe(':sunflowers:');
  });
});
