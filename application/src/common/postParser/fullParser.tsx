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
  EMOJI_UNICODE_REGEX_RANGE,
  EMOJI_ASCII_REGEX_SIMPLE,
  MIN_EMOJI_PATTERN_LEN,
  EMOJI_REGEX,
  NUMBER_WITH_PLUS,
  MIN_PHONE_NUMBER_LENGTH,
  EMOJI_ONE_REGEX_SIMPLE,
  MIN_ATMENTION_PATTERN_LENGTH,
  MIN_ORIGINAL_ATMENTION_PATTERN_LENGTH,
} from './utils';
import { URLParser } from './parsers/URLParser';
import moize from 'moize';
import { mainLogger } from 'foundation/log';
import { AtMentionTransformer } from './parsers/AtMentionTransformer';

/* eslint-disable no-use-before-define */
// Do not change the order of the array unless you know what you're doing.
const parsersConfig = [
  {
    Parser: AtMentionParser,
    shouldParse: (fullText: string, { atMentions, html }: PostParserOptions) =>
      !html &&
      atMentions &&
      fullText.length >= MIN_ATMENTION_PATTERN_LENGTH &&
      fullText.includes(' <at_mention id='),
    getParserOption: ({
      keyword,
      atMentions = {},
    }: PostParserOptions): AtMentionParserOption => {
      const opts: AtMentionParserOption = atMentions;
      opts.innerContentParser = (text: string) =>
        keyword ? postParser(text, { keyword }) : text;
      return opts;
    },
  },
  {
    Parser: EmojiParser,
    shouldParse: (fullText: string, { emoji }: PostParserOptions) =>
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
    shouldParse: (fullText: string, { keyword }: PostParserOptions) => keyword,
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
    shouldParse: (fullText: string, { phoneNumber }: PostParserOptions) => {
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
        keyword ? postParser(text, { keyword }) : text,
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

  if (!emojiOptions.unicodeOnly && /:.+:/.test(fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.CUSTOM,
    );
  }
  if (new RegExp(EMOJI_ONE_REGEX_SIMPLE).test(fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.EMOJI_ONE,
    );
  }

  if (new RegExp(EMOJI_ASCII_REGEX_SIMPLE).test(fullText)) {
    _fullText = EmojiTransformer.replace(
      _fullText,
      emojiOptions,
      EmojiConvertType.ASCII,
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
    innerOptions.atMentionTransformed = true;
    // No need to parse PhoneLink/URL/AtMention if content is already in a tag
    const isInLink = containerTag && containerTag.toLowerCase() === 'a';
    innerOptions.phoneNumber = options.phoneNumber && !isInLink;
    innerOptions.url = options.url && !isInLink;
    innerOptions.atMentions =
      options.atMentions && isInLink ? undefined : options.atMentions;
    innerOptions.keyword = options.keyword;
    innerOptions.emoji = options.emoji;

    return postParser(text, innerOptions);
  };
  opts.withGlipdown = !(
    typeof html === 'object' && html.withGlipdown === false
  ); // default to true unless specified explicitly
  const htmlParser = new HTMLParser(opts);
  return htmlParser.setContent(markdownText).parse();
};

const postParser: FullParser = (
  fullText: string,
  options: PostParserOptions = {},
) => {
  if (typeof fullText !== 'string' || !fullText.trim()) {
    return fullText;
  }
  // In case the parser throw error and crash the whole page, we need to prevent the crashing and log error.
  try {
    const {
      html,
      emoji,
      emojiTransformed,
      atMentions,
      atMentionTransformed,
    } = options;
    const atMentionRegex = new RegExp(AT_MENTION_GROUPED_REGEXP);
    let transformedText = fullText;

    if (
      atMentions &&
      !atMentionTransformed &&
      transformedText.length >= MIN_ORIGINAL_ATMENTION_PATTERN_LENGTH &&
      transformedText.includes(`<a class='at_mention_compose' rel='{"id":`) &&
      atMentionRegex.test(transformedText)
    ) {
      transformedText = AtMentionTransformer.replace(transformedText);
      options.atMentionTransformed = true;
    }

    // transform all kinds of emojis to one certain pattern at the very beginning for better performance
    if (emoji && !emojiTransformed) {
      transformedText = _transformEmoji(transformedText, emoji);
      options.emojiTransformed = true;
    }

    if (html) {
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

const moizePostParser = moize(postParser, {
  maxSize: 300,
  maxAge: 300e3,
  updateExpire: true,
  transformArgs: ([text, options]) => {
    return [
      `${text} ${options.keyword} ${options.html} ${
        options.phoneNumber
      } ${Object.values(options.atMentions.map)
        .map(({ name }) => name)
        .join(',')}`,
    ];
  },
});

export { moizePostParser, postParser };
