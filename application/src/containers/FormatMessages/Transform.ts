/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { glipdown2Html } from '@/utils/glipdown2Html';
import { CustomEmojiMap } from './types';
import { Emoji } from './Emoji';

class Transform {
  text = '';

  constructor(text: string) {
    this.text = text;
  }

  glipdown(atMentionIdMaps: { number?: string }, currentUserId: number) {
    const toMdString = Markdown(this.text);
    const toHtmlString = glipdown2Html(toMdString);
    const atMentionCompose = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>([^<]+)<\/a>/g;
    this.text = toHtmlString.replace(atMentionCompose, (match: string, id: string, name: string) => {
      const text = atMentionIdMaps[id] || name;
      return `<a class='at_mention_compose ${+id === currentUserId ? 'current' : ''}' href='javascript:void(0)' id=${id}>${text}</a>`;
    });
    return this;
  }

  emoji(staticHttpServer: string, customEmojiMap: CustomEmojiMap) {
    const e = new Emoji(this.text, staticHttpServer, customEmojiMap);
    e.formatAscii().formatEmojiOne().formatCustom();
    this.text = e.text;
    return this;
  }
}
export { Transform };
