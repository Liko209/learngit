/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { handleAtMentionName } from './utils/handleAtMentionName';
import { CustomEmojiMap, AtMentions, FormatToHtmlParams } from './types';
import { Emoji } from './Emoji';

class FormatToHtml {
  text: string;
  private _atMentions: AtMentions;
  private _currentUserId: number;
  private _staticHttpServer: string;
  private _customEmojiMap: CustomEmojiMap;

  constructor(params: FormatToHtmlParams) {
    const { text, atMentions, currentUserId, staticHttpServer, customEmojiMap } = params;
    this.text = text;
    this._atMentions = atMentions;
    this._currentUserId = currentUserId;
    this._staticHttpServer = staticHttpServer;
    this._customEmojiMap = customEmojiMap;
    this.formatToGlipdown();
    this.formatToEmoji();
  }

  formatToGlipdown() {
    const toMdString = Markdown(this.text);
    const atMentionId = this._atMentions;
    const currentUserId = this._currentUserId;
    this.text = handleAtMentionName(toMdString, atMentionId, currentUserId);
    return this;
  }

  formatToEmoji() {
    const e = new Emoji(this.text, this._staticHttpServer, this._customEmojiMap);
    this.text = e.text;
    return this;
  }
}
export { FormatToHtml };
