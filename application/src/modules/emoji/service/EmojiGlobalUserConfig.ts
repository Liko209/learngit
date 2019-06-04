/*
 * @Author: ken.li
 * @Date: 2019-05-29 13:29:54
 * Copyright © RingCentral. All rights reserved.
 */

import { UIGlobalConfig } from '../../common/UIGlobalConfig';
import { EMOJI_SETTINGS } from './configKeys';

class EmojiGlobalUserConfig extends UIGlobalConfig {
  static moduleName = `${UIGlobalConfig.moduleName}.emoji`;

  static setEmojiKeepOpen(status: boolean) {
    this.put(EMOJI_SETTINGS.KEEP_OPEN, status);
  }
  static getEmojiKeepOpen() {
    return this.get(EMOJI_SETTINGS.KEEP_OPEN);
  }
}

export { EmojiGlobalUserConfig };
