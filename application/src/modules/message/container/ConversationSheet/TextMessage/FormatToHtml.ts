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
type FormatEmojiOptions = {
  staticHttpServer: string;
  customEmojiMap: CustomEmojiMap;
  unicodeOnly?: boolean;
};
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
    unicodeOnly,
  }: FormatToHtmlParams) {
    const glipDownText = this.formatToGlipdown(text, atMentions, currentUserId);

    const glipDownTextWithEmoji = this.formatToEmoji(glipDownText, {
      staticHttpServer,
      customEmojiMap,
      unicodeOnly,
    });

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
    { staticHttpServer, customEmojiMap, ...opts }: FormatEmojiOptions,
  ) {
    return new Emoji(text, staticHttpServer, customEmojiMap, opts).text;
  }
}

FormatToHtml.formatToHtml = moize(FormatToHtml.formatToHtml, {
  maxSize: 100,
  transformArgs([{ text, atMentions }]: [FormatToHtmlParams]) {
    return [text, JSON.stringify(atMentions)];
  },
});

export { FormatToHtml };
