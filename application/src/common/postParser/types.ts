/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:35:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ParseContent } from './ParseContent';
import { createContext } from 'react';

type ChildrenType = React.ReactChild | null | (React.ReactChild | null)[];

type ParserOption = {
  innerContentParser?: (fullText: string) => ChildrenType;
};

type AtMentionsMapType = {
  [id: number]: {
    name?: string;
    isCurrent?: boolean;
  };
};

type AtMentionParserOption = ParserOption & {
  map?: AtMentionsMapType;
  customReplaceFunc?: (
    match: string,
    id: string,
    name: string,
    isCurrent: boolean,
  ) => ChildrenType;
};

enum EmojiConvertType {
  UNICODE,
  ASCII,
  CUSTOM,
  EMOJI_ONE,
}

type EmojiTransformerOption = ParserOption & {
  unicodeOnly?: boolean;
};

type FileNameParserOption = ParserOption & {
  maxLength?: number;
  tailLength?: number;
};

type HTMLParserOption = ParserOption & {
  withGlipdown?: boolean;
  containerTag?: string;
  innerContentParser?: (
    fullText: string,
    containerTag?: string,
  ) => ChildrenType;
};

type KeywordHighlightParserOption = ParserOption & {
  keyword?: string;
};

type PhoneNumberParserOption = ParserOption & {};

type URLParserOption = ParserOption & {};

type PostParserOptions = {
  fileName?: boolean | FileNameParserOption;
  keyword?: KeywordHighlightParserOption['keyword'];
  url?: boolean;
  phoneNumber?: boolean;
  atMentions?: AtMentionParserOption;
  emoji?: EmojiTransformerOption;
  html?: boolean | HTMLParserOption;
  emojiTransformed?: boolean;
  atMentionTransformed?: boolean;
};

interface IPostParser {
  type: ParserType;
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
  element?: ChildrenType;
};

type HighlightContextInfo = {
  keyword: string;
  dataTrackingJumpToConversation?: Function;
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
  EmojiTransformerOption,
  FileNameParserOption,
  HTMLParserOption,
  KeywordHighlightParserOption,
  PhoneNumberParserOption,
  URLParserOption,
};
