/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:35:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ParseContent } from './ParseContent';
import { createContext } from 'react';
import { CustomEmojiMap } from '../emojiHelpers';

type ChildrenType = React.ReactChild | null | (React.ReactChild | null)[];

type ParserOption = {
  innerContentParser?: FullParser;
};

type AtMentionsMapType = {
  [id: number]: {
    name?: string;
    isCurrent?: boolean;
  };
};

type AtMentionParserOption = ParserOption & {
  map?: AtMentionsMapType;
  isEscaped?: boolean;
  customReplaceFunc?: (
    match: string,
    id: string,
    name: string,
    isCurrent: boolean,
  ) => ChildrenType;
  textEncoded?: boolean;
};

enum EmojiConvertType {
  UNICODE,
  ASCII,
  CUSTOM,
  EMOJI_ONE,
}

type EmojiParserOption = ParserOption & {
  customEmojiMap?: CustomEmojiMap;
  unicodeOnly?: boolean;
  convertType: EmojiConvertType;
  hostName?: string;
  isEscaped?: boolean;
};

type FileNameParserOption = ParserOption & {
  maxLength?: number;
  tailLength?: number;
};

type HTMLParserOption = ParserOption & {
  exclude?: RegExp;
  withGlipdown?: boolean;
  containerTag?: string;
};

type KeywordHighlightParserOption = ParserOption & {
  keyword?: string;
};

type PhoneNumberParserOption = ParserOption & {};

type URLParserOption = ParserOption & {};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type PostParserOptions = {
  fileName?: boolean | FileNameParserOption;
  keyword?: KeywordHighlightParserOption['keyword'];
  url?: boolean;
  phoneNumber?: boolean;
  atMentions?: AtMentionParserOption;
  emoji?: Omit<EmojiParserOption, 'convertType'>;
  html?: boolean | HTMLParserOption;
};

interface IPostParser {
  type: ParserType;
  ignoredRangeTypes: ParserType[];
  content: ParseContent;
  setContent: (content: ParseContent) => void;
  parseToReplacers: () => Replacer[];
}

enum ParserType {
  KEYWORD_HIGHLIGHT,
  PHONE_NUMBER,
  FILE_NAME,
  AT_MENTION,
  EMOJI,
  HTML,
  URL,
}

type FullParser = (
  fullText: string,
  options?: PostParserOptions,
) => ChildrenType;

type TextRange = {
  startIndex: number;
  length: number;
  parserType?: ParserType;
};

type Replacer = TextRange & {
  element: ChildrenType;
};

type HighlightContextInfo = {
  keyword: string;
};

const SearchHighlightContext = createContext<HighlightContextInfo>({
  keyword: '',
});

export {
  IPostParser,
  AtMentionsMapType,
  EmojiConvertType,
  FullParser,
  TextRange,
  Replacer,
  ParserType,
  HighlightContextInfo,
  SearchHighlightContext,
  ChildrenType,
};

export {
  ParserOption,
  PostParserOptions,
  AtMentionParserOption,
  EmojiParserOption,
  FileNameParserOption,
  HTMLParserOption,
  KeywordHighlightParserOption,
  PhoneNumberParserOption,
  URLParserOption,
};
