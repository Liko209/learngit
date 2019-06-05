/*
 * @Author: ken.li
 * @Date: 2019-06-02 17:55:13
 * Copyright © RingCentral. All rights reserved.
 */
const ITEM_HEIGHT = 40; // jui/pattern/MessageInput/Mention/MentionPanelSectionItem
const MAX_ITEM_NUMBER = 6;

const INIT_CURRENT_INDEX = 1; // because of title will within VL
const TITLE_HEIGHT = 32;
const ITEM_DIFF = ITEM_HEIGHT - TITLE_HEIGHT;
const EMOJI_SIZE = {
  small: 16,
  medium: 20,
  large: 32,
  giant: 64,
};

const PRELOAD_ITEM = {
  id: 12,
  url:
    'https://unpkg.com/emoji-datasource-emojione@4.0.4/img/emojione/sheets-256/64.png',
};

export {
  ITEM_HEIGHT,
  MAX_ITEM_NUMBER,
  INIT_CURRENT_INDEX,
  TITLE_HEIGHT,
  ITEM_DIFF,
  EMOJI_SIZE,
  PRELOAD_ITEM,
};
