/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { glipdown2Html } from '@/utils/glipdown2Html';
import { formatEmojiOne, formatAscii, formatCustom, handleAtMentionName } from './utils';

class Transform {
  text = '';

  constructor(text: string) {
    this.text = text;
  }

  glipdown(atMentionIdMaps: { number?: string }, currentUserId: number) {
    const toMdString = Markdown(this.text);
    const toHtmlString = glipdown2Html(toMdString);
    this.text = handleAtMentionName(
      toHtmlString,
      atMentionIdMaps,
      currentUserId,
    );
    return this;
  }

  emoji(customEmojiMap: { [index: string]: { data: string } }) {
    this.text = formatAscii(this.text);
    this.text = formatEmojiOne(this.text);
    this.text = formatCustom(this.text, customEmojiMap);
    return this;
  }
}
export { Transform };
