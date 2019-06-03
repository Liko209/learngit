/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 14:53:35
 * Copyright © RingCentral. All rights reserved.
 */
import { ParseContent } from './ParseContent';
import {
  PostParserOptions,
  FullParser,
  HTMLParserOption,
  AtMentionParserOption,
  EmojiParserOption,
  EmojiConvertType,
  FileNameParserOption,
  URLParserOption,
  KeywordHighlightParserOption,
  PhoneNumberParserOption,
} from './types';
import { KeywordHighlightParser } from './parsers/KeywordHighlightParser';
import { PhoneNumberParser } from './parsers/PhoneNumberParser';
import { FileNameParser } from './parsers/FileNameParser';
import { AtMentionParser } from './parsers/AtMentionParser';
import { EmojiParser } from './parsers/EmojiParser';
import { HTMLParser } from './parsers/HTMLParser';
import {
  AT_MENTION_REGEX,
  EMOJI_UNICODE_REGEX,
  EMOJI_CUSTOM_REGEX,
  EMOJI_ASCII_REGEX,
  EMOJI_ONE_REGEX,
} from './utils';
import { URLParser } from './parsers/URLParser';
import _ from 'lodash';

// Do not change the order of the array unless you know what you're doing.
const parsersConfig = [
  {
    Parser: HTMLParser,
    shouldParse: (fullText: string, options: PostParserOptions) => options.html,
    getParserOption: (
      fullText: string,
      options: PostParserOptions,
    ): HTMLParserOption => {
      const { html, emoji } = options;
      const regexpToRemoveMarkdown = [
        new RegExp(AT_MENTION_REGEX).source,
        new RegExp(EMOJI_UNICODE_REGEX).source,
        new RegExp(EMOJI_ASCII_REGEX).source,
        emoji &&
        emoji.customEmojiMap &&
        Object.keys(emoji.customEmojiMap).length
          ? new RegExp(EMOJI_CUSTOM_REGEX(emoji!.customEmojiMap, false)).source
          : '',
        new RegExp(EMOJI_ONE_REGEX).source,
      ]
        .map(regStr => `(${regStr})`)
        .join('|');
      const withGlipdown = !(
        typeof html === 'object' && html.withGlipdown === false
      ); // default to true unless specified explicitly
      return {
        exclude: new RegExp(regexpToRemoveMarkdown, 'g'),
        innerContentParser: (text: string) =>
          postParser(
            text,
            _.merge<{}, PostParserOptions, Partial<PostParserOptions>>(
              {},
              options,
              {
                html: false, // inner text node does not need to use html parser anymore
                atMentions: { isEscaped: false, textEncoded: true }, // inner text node is already unescaped
                emoji: { isEscaped: false }, // inner text node is already unescaped
              },
            ),
          ),
        ...(html instanceof Object ? html : {}),
        withGlipdown,
      };
    },
  },
  {
    Parser: AtMentionParser,
    shouldParse: (fullText: string, { atMentions }: PostParserOptions) =>
      atMentions && Object.keys(atMentions).length,
    getParserOption: (
      fullText: string,
      { keyword, html, atMentions = {} }: PostParserOptions,
    ): AtMentionParserOption => ({
      isEscaped: !!html,
      innerContentParser: (text: string) => postParser(text, { keyword }),
      ...atMentions,
    }),
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji,
    getParserOption: (
      fullText: string,
      { emoji = {}, html }: PostParserOptions,
    ): EmojiParserOption => ({
      isEscaped: !!html,
      convertType: EmojiConvertType.UNICODE,
      ...emoji,
    }),
  },

  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji,
    getParserOption: (
      fullText: string,
      { emoji = {} }: PostParserOptions,
    ): EmojiParserOption => ({
      convertType: EmojiConvertType.ASCII,
      ...emoji,
    }),
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options &&
      options.emoji &&
      options.emoji.customEmojiMap &&
      Object.keys(options.emoji.customEmojiMap).length,
    getParserOption: (
      fullText: string,
      { emoji = {} }: PostParserOptions,
    ): EmojiParserOption => ({
      convertType: EmojiConvertType.CUSTOM,
      ...emoji,
    }),
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji,
    getParserOption: (
      fullText: string,
      { emoji = {} }: PostParserOptions,
    ): EmojiParserOption => ({
      convertType: EmojiConvertType.EMOJI_ONE,
      ...emoji,
    }),
  },
  {
    Parser: FileNameParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.fileName,
    getParserOption: (
      fullText: string,
      { keyword, fileName }: PostParserOptions,
    ): FileNameParserOption => ({
      innerContentParser: (text: string) => postParser(text, { keyword }),
      ...(fileName instanceof Object ? fileName : {}),
    }),
  },
  {
    Parser: URLParser,
    shouldParse: (fullText: string, options: PostParserOptions) => options.url,
    getParserOption: (
      fullText: string,
      { keyword }: PostParserOptions,
    ): URLParserOption => ({
      innerContentParser: (text: string) => postParser(text, { keyword }),
    }),
  },
  {
    Parser: KeywordHighlightParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.keyword,
    getParserOption: (
      fullText: string,
      { keyword }: PostParserOptions,
    ): KeywordHighlightParserOption => ({
      keyword,
      innerContentParser: (text: string) =>
        postParser(text, { phoneNumber: true }),
    }),
  },
  {
    Parser: PhoneNumberParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.phoneNumber,
    getParserOption: (
      fullText: string,
      { keyword }: PostParserOptions,
    ): PhoneNumberParserOption => ({
      innerContentParser: (text: string) => postParser(text, { keyword }),
    }),
  },
];

const postParser: FullParser = (
  fullText: string,
  options?: PostParserOptions,
) => {
  if (typeof fullText !== 'string' || !fullText.trim()) {
    return fullText;
  }
  const content = new ParseContent(fullText);
  parsersConfig.forEach(({ Parser, shouldParse, getParserOption }) => {
    if (shouldParse(fullText, { ...options })) {
      const parser = new Parser(getParserOption(
        fullText,
        options || {},
      ) as any);
      const replacers = parser.setContent(content).parseToReplacers();
      content.addReplacers(replacers);
    }
  });

  return content.getParsedResult();
};

export { postParser };
