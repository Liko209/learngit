/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { handleAtMentionName } from '@/utils/handleAtMentionName';
import { Markdown } from 'glipdown';

class FormatText {
  text = '';
  constructor(text: string) {
    this.text = text;
  }

  glipdown(atMentionIdMaps: { number?: string }, currentUserId: number) {
    const toMdString = Markdown(this.text);
    this.text = handleAtMentionName(
      toMdString,
      atMentionIdMaps,
      currentUserId,
    );
    return this;
  }
  // todo
  // emoji() {
  //
  //   return this;
  // }
}
export { FormatText };
