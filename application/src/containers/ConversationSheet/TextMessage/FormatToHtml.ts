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
    highlightTerms,
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

    const glipDownTextWithHighlight =
      highlightTerms && highlightTerms.length
        ? FormatToHtml.formatToHighlight(glipDownTextWithEmoji, highlightTerms)
        : glipDownTextWithEmoji;

    return glipDownTextWithHighlight;
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

  static formatToHighlight(text: string, terms: string[]) {
    let reg = terms.join('|');
    reg = reg.replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
    return text.replace(new RegExp(reg, 'gi'), (term: string) => {
      return `<span class="highlight-term">${term}</span>`;
    });
  }
}

FormatToHtml.formatToHtml = moize(FormatToHtml.formatToHtml, {
  maxSize: 100,
  transformArgs([{ text, atMentions }]: [FormatToHtmlParams]) {
    return [text, JSON.stringify(atMentions)];
  },
});

export { FormatToHtml };
