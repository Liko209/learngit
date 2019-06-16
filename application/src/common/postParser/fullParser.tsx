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
  AT_MENTION_GROUPED_REGEXP,
  b64EncodeUnicode,
  EMOJI_UNICODE_REGEX_RANGE,
  EMOJI_ASCII_UNIQUE_CHARS,
} from './utils';
import { URLParser } from './parsers/URLParser';
import _ from 'lodash';
import moize from 'moize';

// Do not change the order of the array unless you know what you're doing.
const parsersConfig = [
  {
    Parser: HTMLParser,
    shouldParse: (fullText: string, options: PostParserOptions) => options.html,
    getParserOption: (options: PostParserOptions): HTMLParserOption => {
      const { html } = options;
      const innerOptions = _.clone(options);
      innerOptions.html = false;

      const opts: HTMLParserOption = html instanceof Object ? html : {};
      opts.innerContentParser = (text: string) =>
        postParser(text, innerOptions);
      opts.withGlipdown = !(
        typeof html === 'object' && html.withGlipdown === false
      ); // default to true unless specified explicitly

      return opts;
    },
  },
  {
    Parser: AtMentionParser,
    shouldParse: (fullText: string, { atMentions }: PostParserOptions) =>
      atMentions && Object.keys(atMentions).length && fullText.length >= 48, // min-length for a string that includes at mention
    getParserOption: ({
      keyword,
      html,
      atMentions = {},
    }: PostParserOptions): AtMentionParserOption => {
      const opts: AtMentionParserOption = atMentions;
      opts.isEscaped = !!html;
      opts.textEncoded = !html;
      opts.innerContentParser = (text: string) =>
        keyword ? postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji && new RegExp(EMOJI_UNICODE_REGEX_RANGE).test(fullText),
    getParserOption: ({
      html,
      emoji = {},
    }: PostParserOptions): EmojiParserOption => {
      const opts: EmojiParserOption = emoji;
      opts.isEscaped = !!html;
      opts.convertType = EmojiConvertType.UNICODE;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji &&
      !options.emoji.keepASCII &&
      new RegExp(EMOJI_ASCII_UNIQUE_CHARS).test(fullText),
    getParserOption: ({
      html,
      emoji = {},
    }: PostParserOptions): EmojiParserOption => {
      const opts: EmojiParserOption = emoji;
      opts.isEscaped = !!html;
      opts.convertType = EmojiConvertType.ASCII;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options &&
      options.emoji &&
      options.emoji.customEmojiMap &&
      Object.keys(options.emoji.customEmojiMap).length &&
      /:.*?:/.test(fullText),
    getParserOption: ({
      html,
      emoji = {},
    }: PostParserOptions): EmojiParserOption => {
      const opts: EmojiParserOption = emoji;
      opts.isEscaped = !!html;
      opts.convertType = EmojiConvertType.CUSTOM;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.emoji && /:.*?:/.test(fullText),
    getParserOption: ({
      html,
      emoji = {},
    }: PostParserOptions): EmojiParserOption => {
      const opts: EmojiParserOption = emoji;
      opts.isEscaped = !!html;
      opts.convertType = EmojiConvertType.EMOJI_ONE;
      return opts;
    },
  },
  {
    Parser: FileNameParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.fileName,
    getParserOption: ({
      keyword,
      fileName,
    }: PostParserOptions): FileNameParserOption => {
      const opts: FileNameParserOption =
        fileName instanceof Object ? fileName : {};
      opts.innerContentParser = (text: string) =>
        keyword ? postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: URLParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.url && fullText.includes('.'),
    getParserOption: ({ keyword }: PostParserOptions): URLParserOption => ({
      innerContentParser: (text: string) =>
        keyword ? postParser(text, { keyword }) : text,
    }),
  },
  {
    Parser: KeywordHighlightParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.keyword,
    getParserOption: ({
      keyword,
      phoneNumber,
    }: PostParserOptions): KeywordHighlightParserOption => ({
      keyword,
      innerContentParser: (text: string) =>
        phoneNumber && /\d/g.test(text)
          ? postParser(text, { phoneNumber: true })
          : text,
    }),
  },
  {
    Parser: PhoneNumberParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.phoneNumber && /\d/g.test(fullText),
    getParserOption: ({
      keyword,
    }: PostParserOptions): PhoneNumberParserOption => ({
      innerContentParser: (text: string) =>
        keyword ? postParser(text, { keyword }) : text,
    }),
  },
];

const _postParser: FullParser = (
  fullText: string,
  options?: PostParserOptions,
) => {
  if (typeof fullText !== 'string' || !fullText.trim()) {
    return fullText;
  }
  const atMentionRegex = new RegExp(AT_MENTION_GROUPED_REGEXP);
  let _fullText = fullText;
  if (options && options.html && atMentionRegex.test(fullText)) {
    _fullText = fullText.replace(
      AT_MENTION_GROUPED_REGEXP, // we need to encode the text inside atmention so it won't get parsed first, for example when some crazy user name is a url
      (full, g1, g2, g3) => `${g1}${b64EncodeUnicode(g2)}${g3}`,
    );
  }
  const content = new ParseContent(_fullText);
  parsersConfig.forEach(({ Parser, shouldParse, getParserOption }) => {
    if (shouldParse(_fullText, options || {})) {
      const parser = new Parser(getParserOption(options || {}) as any);
      const replacers = parser.setContent(content).parseToReplacers();
      content.addReplacers(replacers);
    }
  });

  return content.getParsedResult();
};

const postParser = moize(_postParser, {
  maxSize: 100,
  transformArgs: ([text, options]) => [text, JSON.stringify(options)],
});

export { postParser };
