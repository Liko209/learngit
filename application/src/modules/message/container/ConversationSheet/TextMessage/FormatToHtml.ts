/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { Markdown } from 'glipdown';
import moize from 'moize';
import i18next from 'i18next';
import { handleAtMentionName } from './utils/handleAtMentionName';
import { CustomEmojiMap, AtMentions, FormatToHtmlParams } from './types';
import { Emoji } from './Emoji';
import { isValidPhoneNumber } from '@/modules/common/container/PhoneParser/parserNumber';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { PHONE_LINKS_CLS, PHONE_NUMBER_REGEX } from './constants';

type FormatEmojiOptions = {
  staticHttpServer: string;
  customEmojiMap: CustomEmojiMap;
  unicodeOnly?: boolean;
};
class FormatToHtml {
  text: string = '';

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
    const _isRCUser = getGlobalValue(GLOBAL_KEYS.IS_RC_USER);
    const mdText = Markdown(text);
    let replacedText = mdText;
    const isVideoCall =
      text && text.includes(i18next.t('item.dialInNumber'));
    if (isVideoCall && _isRCUser) {
      const dividedStrings = mdText.split(/(\n|\r)/) || [];
      const lastElement = dividedStrings[dividedStrings.length - 1];
      const matchedNumber = lastElement.match(PHONE_NUMBER_REGEX) || [];
      const replacedValue = this.getPhoneLink(matchedNumber[0]);
      replacedText = replacedText.replace(matchedNumber[0], replacedValue);
    }
    if (!isVideoCall) {
      const dividedStrings = mdText && mdText.split(/(&lt;a|a&gt;|<a|<\/a>|\n|\r)/) || [];
      const contents = dividedStrings.map((item: string) => {
        const IS_LINK_ELEMENT = /(&lt;\/|^http|https:\/\/|<a)/.test(item);
        if (!IS_LINK_ELEMENT) {
          return item && item.replace(PHONE_NUMBER_REGEX, match => {
            if (isValidPhoneNumber(match) && _isRCUser) {
              return this.getPhoneLink(match);
            }
            return match;
          });
        }
        return item;
      });
      replacedText = contents.join('');
    }
    const mdTextWithAtMention = handleAtMentionName(
      replacedText,
      atMentions,
      currentUserId,
    );
    return mdTextWithAtMention;
  }
  static getPhoneLink(match: string) {
    return `<a href="javascript:;" color="#18a4de" class=${PHONE_LINKS_CLS} data-test-automation-id="phoneNumberLink" data-id=${match}>${match}</a>`;
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
