/*
 * @Author: ken.li
 * @Date: 2019-04-29 15:51:03
 * Copyright © RingCentral. All rights reserved.
 */
type EmojiProps = {
  handleEmojiClick?: any;
  title?: string;
  sheetSize?: 16 | 20 | 32 | 64;
  icon?: string;
  set?: 'apple' | 'google' | 'twitter' | 'emojione' | 'messenger' | 'facebook';
  defaultProps?: any;
  tooltip?: string;
};

type EmojiViewProps = {
  setEmojiOpenStatus: () => void;
  emojiOpenStatus: boolean;
  defaultProps?: any;
};

export { EmojiProps, EmojiViewProps };
