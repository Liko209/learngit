/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { Markdown } from 'glipdown';
import moize from 'moize';
import { handleAtMentionName } from './utils/handleAtMentionName';
import { CustomEmojiMap, AtMentions, FormatToHtmlParams } from './types';
import { Emoji } from './Emoji';

class FormatToHtml {
  text: string;

  constructor(params: FormatToHtmlParams) {
    this.text = FormatToHtml.formatToHtml(params);
  }

  static formatToHtml({
    text,
    atMentions,
    currentUserId,
    staticHttpServer,
    customEmojiMap,
  }: FormatToHtmlParams) {
    const glipDownText = FormatToHtml.formatToGlipdown(
      text,
      atMentions,
      currentUserId,
    );

    const glipDownTextWithEmoji = FormatToHtml.formatToEmoji(
      glipDownText,
      staticHttpServer,
      customEmojiMap,
    );

    return glipDownTextWithEmoji;
  }

  static formatToGlipdown(
    text: string,
    atMentions: AtMentions,
    currentUserId: number,
  ) {
    const mdText = Markdown(text);
    const mdTextWithAtMention = handleAtMentionName(
      mdText,
      atMentions,
      currentUserId,
    );
    return mdTextWithAtMention;
  }

  static formatToEmoji(
    text: string,
    staticHttpServer: string,
    customEmojiMap: CustomEmojiMap,
  ) {
    return new Emoji(text, staticHttpServer, customEmojiMap).text;
  }
}

FormatToHtml.formatToHtml = moize(FormatToHtml.formatToHtml, {
  maxSize: 100,
  transformArgs([{ text, atMentions }]: [FormatToHtmlParams]) {
    return [text, JSON.stringify(atMentions)];
  },
});

export { FormatToHtml };
