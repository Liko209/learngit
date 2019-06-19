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
  FileNameParserOption,
  URLParserOption,
  KeywordHighlightParserOption,
  PhoneNumberParserOption,
  EmojiConvertType,
  EmojiTransformerOption,
} from './types';
import { KeywordHighlightParser } from './parsers/KeywordHighlightParser';
import { PhoneNumberParser } from './parsers/PhoneNumberParser';
import { FileNameParser } from './parsers/FileNameParser';
import { AtMentionParser } from './parsers/AtMentionParser';
import { EmojiTransformer } from './parsers/EmojiTransformer';
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
import { mainLogger } from 'sdk';
import { EmojiParser } from './parsers/EmojiParser';

// Do not change the order of the array unless you know what you're doing.
const parsersConfig = [
  {
    Parser: HTMLParser,
    shouldParse: (fullText: string, options: PostParserOptions) => options.html,
    getParserOption: (options: PostParserOptions): HTMLParserOption => {
      const { html } = options;

      const opts: HTMLParserOption = html instanceof Object ? html : {};
      opts.innerContentParser = (text: string, containerTag?: string) => {
        const innerOptions = _.clone(options);
        // No need to parse html since the inner content is surely plain text (no tags)
        innerOptions.html = false;
        // No need to parse PhoneLink/URL/AtMention if content is already in a tag
        const isInLink = containerTag && containerTag.toLowerCase() === 'a';
        innerOptions.phoneNumber = options.phoneNumber && !isInLink;
        innerOptions.url = options.url && !isInLink;
        innerOptions.atMentions =
          options.atMentions && isInLink ? undefined : options.atMentions;
        return postParser(text, innerOptions);
      };
      opts.withGlipdown = !(
        typeof html === 'object' && html.withGlipdown === false
      ); // default to true unless specified explicitly

      return opts;
    },
  },
  {
    Parser: AtMentionParser,
    shouldParse: (fullText: string, { atMentions, html }: PostParserOptions) =>
      !html && atMentions && fullText.length >= 48, // min-length for a string that includes at mention
    getParserOption: ({
      keyword,
      html,
      atMentions = {},
    }: PostParserOptions): AtMentionParserOption => {
      const opts: AtMentionParserOption = atMentions;
      opts.textEncoded = html === undefined ? false : !html;
      opts.innerContentParser = (text: string) =>
        keyword ? postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, { emoji, html }: PostParserOptions) =>
      emoji && !html,
    getParserOption: (): AtMentionParserOption => ({}),
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
    shouldParse: (fullText: string, { keyword, html }: PostParserOptions) =>
      keyword && !html,
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
    shouldParse: (fullText: string, { phoneNumber, html }: PostParserOptions) =>
      phoneNumber && !html && /\d/g.test(fullText),
    getParserOption: ({
      keyword,
    }: PostParserOptions): PhoneNumberParserOption => ({
      innerContentParser: (text: string) =>
        keyword ? postParser(text, { keyword }) : text,
    }),
  },
];

const transformEmoji = (
  fullText: string,
  emojiOptions: EmojiTransformerOption,
) => {
  let _fullText = fullText;
  const emojiTransformer = new EmojiTransformer();
  if (new RegExp(EMOJI_UNICODE_REGEX_RANGE).test(_fullText)) {
    _fullText = emojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.UNICODE,
    );
  }
  if (new RegExp(EMOJI_ASCII_UNIQUE_CHARS).test(fullText)) {
    _fullText = emojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.ASCII,
    );
  }
  if (
    emojiOptions.customEmojiMap &&
    Object.keys(emojiOptions.customEmojiMap).length &&
    /:.*?:/.test(fullText)
  ) {
    _fullText = emojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.CUSTOM,
    );
  }
  if (/:.*?:/.test(fullText)) {
    _fullText = emojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.EMOJI_ONE,
    );
  }
  return _fullText;
};

const _postParser: FullParser = (
  fullText: string,
  options?: PostParserOptions,
) => {
  if (typeof fullText !== 'string' || !fullText.trim()) {
    return fullText;
  }
  // In case the parser throw error and crash the whole page, we need to prevent the crashing and log error.
  try {
    const atMentionRegex = new RegExp(AT_MENTION_GROUPED_REGEXP);
    let _fullText = fullText;
    if (options && options.emoji && !options.emojiTransformed) {
      _fullText = transformEmoji(_fullText, options.emoji);
      options.emojiTransformed = true;
    }
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
  } catch (err) {
    mainLogger.error(err);
    return fullText;
  }
};

const postParser = moize(_postParser, {
  maxSize: 1000,
  transformArgs: ([text, options]) => {
    return [text, JSON.stringify(options)];
  },
  // onCacheHit: cache => {
  //   console.log('use cache', cache.keys);
  // },
});

export { postParser };
