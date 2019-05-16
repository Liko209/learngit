/*
 * @Author: ken.li
 * @Date: 2019-05-09 19:36:50
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { EmojiView } from '../Emoji.View';
import { EmojiViewModel } from '../Emoji.ViewModel';
import { EmojiProps } from '../types';

jest.mock('@/base');
describe('emoji module', () => {
  it('should have been called', () => {
    buildContainer<EmojiProps>({
      View: EmojiView,
      ViewModel: EmojiViewModel,
    });
    expect(buildContainer).toHaveBeenCalled();
  });
});
