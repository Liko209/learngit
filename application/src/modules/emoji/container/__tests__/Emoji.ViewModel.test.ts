/*
 * @Author: ken.li
 * @Date: 2019-05-29 20:50:03
 * Copyright © RingCentral. All rights reserved.
 */
import { EmojiViewModel } from '../Emoji.ViewModel';
import { EmojiGlobalUserConfig } from '../../service/EmojiGlobalUserConfig';

jest.mock('sdk/module/config/GlobalConfig');

describe('EmojiViewModel', () => {
  let emojiViewModel;
  beforeEach(() => {
    emojiViewModel = new EmojiViewModel();
    jest.spyOn(EmojiGlobalUserConfig, 'setEmojiKeepOpen');
    jest.spyOn(EmojiGlobalUserConfig, 'getEmojiKeepOpen');
  });
  describe('setEmojiOpenStatus', () => {
    it('set function should have been called', () => {
      emojiViewModel.setEmojiOpenStatus(true);
      expect(EmojiGlobalUserConfig.setEmojiKeepOpen).toHaveBeenCalled();
    });
  });
});
