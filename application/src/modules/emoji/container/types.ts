/*
 * @Author: ken.li
 * @Date: 2019-04-29 15:51:03
 * Copyright © RingCentral. All rights reserved.
 */
type EmojiProps = {
  handleEmojiClick?: any;
  title?: string;
  sheetSize: 16 | 20 | 32 | 64 | undefined;
  set:
    | 'apple'
    | 'google'
    | 'twitter'
    | 'emojione'
    | 'messenger'
    | 'facebook'
    | undefined;
};

type EmojiViewProps = {
  setEmojiOpenStatus: () => void;
  emojiOpenStatus: boolean;
};

export { EmojiProps, EmojiViewProps };
