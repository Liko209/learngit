/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { glipdown2Html } from './utils/glipdown2Html';
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
    const toHtmlString = glipdown2Html(toMdString);
    // <a class='at_mention_compose' rel='{"id":2266292227}'>Lip Wang</a>
    const atMentionCompose = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>([^<]+)<\/a>/g;
    this.text = toHtmlString.replace(atMentionCompose, (match: string, id: string, name: string) => {
      const text = this._atMentions[id] || name;
      return `<a class='at_mention_compose ${+id === this._currentUserId ? 'current' : ''}' href='javascript:void(0)' id=${id}>${text}</a>`;
    });
    return this;
  }

  formatToEmoji() {
    const e = new Emoji(this.text, this._staticHttpServer, this._customEmojiMap);
    this.text = e.text;
    return this;
  }
}
export { FormatToHtml };
