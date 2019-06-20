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
import { EmojiParser } from './parsers/EmojiParser';
import {
  AT_MENTION_GROUPED_REGEXP,
  b64EncodeUnicode,
  EMOJI_UNICODE_REGEX_RANGE,
  EMOJI_ASCII_UNIQUE_CHARS,
  MIN_EMOJI_PATTERN_LEN,
  EMOJI_REGEX,
  NUMBER_WITH_PLUS,
  MIN_PHONE_NUMBER_LENGTH,
} from './utils';
import { URLParser } from './parsers/URLParser';
import _ from 'lodash';
import moize from 'moize';
import { mainLogger } from 'sdk';

// Do not change the order of the array unless you know what you're doing.
const parsersConfig = [
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
        keyword ? _postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, { emoji, html }: PostParserOptions) =>
      emoji &&
      fullText.length >= MIN_EMOJI_PATTERN_LEN &&
      fullText.includes("<emoji data='"),
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
        keyword ? _postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: URLParser,
    shouldParse: (fullText: string, options: PostParserOptions) =>
      options.url && fullText.includes('.'),
    getParserOption: ({ keyword }: PostParserOptions): URLParserOption => ({
      innerContentParser: (text: string) =>
        keyword ? _postParser(text, { keyword }) : text,
    }),
  },
  {
    Parser: KeywordHighlightParser,
    shouldParse: (fullText: string, { keyword, html }: PostParserOptions) =>
      keyword,
    getParserOption: ({
      keyword,
      phoneNumber,
    }: PostParserOptions): KeywordHighlightParserOption => ({
      keyword,
      innerContentParser: (text: string) =>
        phoneNumber && /\d/g.test(text)
          ? _postParser(text, { phoneNumber: true })
          : text,
    }),
  },
  {
    Parser: PhoneNumberParser,
    shouldParse: (
      fullText: string,
      { phoneNumber, html }: PostParserOptions,
    ) => {
      if (!phoneNumber || !/\d/.test(fullText)) {
        return false;
      }
      const stringWithoutEmojiPattern = fullText.replace(EMOJI_REGEX, '');
      const matches = stringWithoutEmojiPattern.match(/\d/g);
      return (
        matches &&
        matches.join('').length >=
          (fullText.includes('+') ? NUMBER_WITH_PLUS : MIN_PHONE_NUMBER_LENGTH)
      );
    },
    getParserOption: ({
      keyword,
    }: PostParserOptions): PhoneNumberParserOption => ({
      innerContentParser: (text: string) =>
        keyword ? _postParser(text, { keyword }) : text,
    }),
  },
];

const _transformEmoji = (
  fullText: string,
  emojiOptions: EmojiTransformerOption,
) => {
  let _fullText = fullText;
  if (new RegExp(EMOJI_UNICODE_REGEX_RANGE).test(_fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.UNICODE,
    );
  }
  if (new RegExp(EMOJI_ASCII_UNIQUE_CHARS).test(fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.ASCII,
    );
  }
  if (
    !emojiOptions.unicodeOnly &&
    emojiOptions.customEmojiMap &&
    Object.keys(emojiOptions.customEmojiMap).length &&
    /:.+:/.test(fullText)
  ) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.CUSTOM,
    );
  }
  if (/:\w+:/.test(fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.EMOJI_ONE,
    );
  }
  return _fullText;
};

const _parseMarkdown = (markdownText: string, options: PostParserOptions) => {
  const { html } = options;
  const opts: HTMLParserOption = html && typeof html !== 'boolean' ? html : {};
  opts.innerContentParser = (text: string, containerTag?: string) => {
    const innerOptions: PostParserOptions = {};
    // No need to parse html since the inner content is surely plain text (no tags)
    innerOptions.html = false;
    innerOptions.emojiTransformed = true;
    // No need to parse PhoneLink/URL/AtMention if content is already in a tag
    const isInLink = containerTag && containerTag.toLowerCase() === 'a';
    innerOptions.phoneNumber = options.phoneNumber && !isInLink;
    innerOptions.url = options.url && !isInLink;
    innerOptions.atMentions =
      options.atMentions && isInLink ? undefined : options.atMentions;
    innerOptions.keyword = options.keyword;
    innerOptions.emoji = options.emoji;

    return _postParser(text, innerOptions);
  };
  opts.withGlipdown = !(
    typeof html === 'object' && html.withGlipdown === false
  ); // default to true unless specified explicitly
  const htmlParser = new HTMLParser(opts);
  return htmlParser.setContent(markdownText).parse();
};

const _postParser: FullParser = (
  fullText: string,
  options: PostParserOptions = {},
) => {
  if (typeof fullText !== 'string' || !fullText.trim()) {
    return fullText;
  }
  // In case the parser throw error and crash the whole page, we need to prevent the crashing and log error.
  try {
    const { html, emoji, emojiTransformed } = options;
    const atMentionRegex = new RegExp(AT_MENTION_GROUPED_REGEXP);
    let transformedText = fullText;
    // transform all kinds of emojis to one certain pattern at the very beginning for better performance
    if (emoji && !emojiTransformed) {
      transformedText = _transformEmoji(transformedText, emoji);
      options.emojiTransformed = true;
    }
    if (html) {
      transformedText = atMentionRegex.test(transformedText)
        ? transformedText.replace(
            AT_MENTION_GROUPED_REGEXP, // we need to encode the text inside atmention so it won't get parsed first, for example when some crazy user name is a url
            (full, g1, g2, g3) => `${g1}${b64EncodeUnicode(g2)}${g3}`,
          )
        : transformedText;
      return _parseMarkdown(transformedText, options);
    }
    const content = new ParseContent(transformedText);
    parsersConfig.forEach(({ Parser, shouldParse, getParserOption }) => {
      if (shouldParse(transformedText, options)) {
        const parser = new Parser(getParserOption(options) as any);
        const replacers = parser.setContent(content).parseToReplacers();
        if (replacers.length) {
          content.addReplacers(replacers);
        }
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
