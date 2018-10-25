/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { handleAtMentionName } from '@/utils/handleAtMentionName';
import { Markdown } from 'glipdown';
import { glipdown2Html } from '@/utils/glipdown2Html';

class FormatText {
  text = '';
  constructor(text: string) {
    this.text = text;
  }

  glipdown(atMentionIdMaps: {number?: string}, currentUserId: number) {
    const toMdString = Markdown(this.text);
    const toHtmlString = glipdown2Html(toMdString);
    this.text = handleAtMentionName(toHtmlString, atMentionIdMaps, currentUserId);
    return this;
  }
  // todo
  // emoji() {
  //
  //   return this;
  // }
}
export { FormatText };
