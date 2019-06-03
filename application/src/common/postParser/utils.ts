/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-28 14:32:22
 * Copyright © RingCentral. All rights reserved.
 */
import { TextRange } from './types';
import {
  CustomEmojiMap,
  convertMapUnicode,
  convertMapAscii,
  convertMapEmojiOne,
  regExpUnescape,
  mapUnescape,
  regExpEscape,
  mapEscape,
} from '@/common/emojiHelpers';

const isInRange = (index: number, range: TextRange) => {
  return index >= range.startIndex && index < range.startIndex + range.length;
};

const containsRange = (who: TextRange, whom: TextRange) => {
  return (
    whom.length < who.length &&
    isInRange(whom.startIndex, who) &&
    isInRange(whom.startIndex + whom.length - 1, who)
  );
};

const hasIntersection = (range1: TextRange, range2: TextRange) => {
  return (
    isInRange(range1.startIndex, range2) || isInRange(range2.startIndex, range1)
  );
};

const getComplementRanges = (ranges: TextRange[], fullLength: number) => {
  if (!ranges || !ranges.length) {
    return [
      {
        startIndex: 0,
        length: fullLength,
      },
    ];
  }
  const result: TextRange[] = [];
  ranges
    .sort((a, b) => a.startIndex - b.startIndex)
    .forEach((currentRange, index) => {
      const { startIndex, length } = currentRange;
      if (index === 0) {
        if (startIndex > 0) {
          result.push({
            startIndex: 0,
            length: startIndex,
          });
        }
      }

      const nextRange = ranges[index + 1];
      const start = startIndex + length;
      const len = (nextRange ? nextRange.startIndex : fullLength + 1) - start;
      if (len > 0) {
        result.push({
          startIndex: start,
          length: len,
        });
      }
    });
  return result;
};

// const isHTML = (str: string) => {
//   const div = document.createElement('div');
//   div.innerHTML = str;
//   return div.innerHTML === str;
// };

const HTMLUnescape = (str: string) => {
  return str.replace(regExpUnescape, (match: string) => mapUnescape[match]);
};

const HTMLEscape = (str: string) => {
  return str.replace(regExpEscape, (match: string) => mapEscape[match]);
};

const MATCH_ALL_REGEX = /^[\s\S]+$/g;
const MATCH_NOTHING_REGEX = /a^/g;
const AT_MENTION_REGEX = /<a class='at_mention_compose' rel='{"id":(\d*?)}'>(.*?)<\/a>/gi;
const AT_MENTION_ESCAPED = /&lt;a class=&#x27;at_mention_compose&#x27; rel=&#x27;{&quot;id&quot;:(\d*?)}&#x27;&gt;(.*?)&lt;\/a&gt;/gi;

const EMOJI_UNICODE_REGEX = `${Object.keys(convertMapUnicode).join('|')}`;
const EMOJI_UNICODE_REGEX_ESCAPED = `${Object.keys(convertMapUnicode)
  .map(HTMLEscape)
  .join('|')}`;

const EMOJI_ASCII_REGEX = `(^|\\s)${Object.keys(convertMapAscii).join(
  '(?=\\s|$|[!,.?])|(^|\\s)',
)}(?=\\s|$|[!,.?])`;
const EMOJI_ASCII_REGEX_ESCAPED = `(^|\\s)${Object.keys(convertMapAscii)
  .map(HTMLEscape)
  .join('(?=\\s|$|[!,.?])|(^|\\s)')}(?=\\s|$|[!,.?])`;

const EMOJI_ONE_REGEX = `${Object.keys(convertMapEmojiOne).join('|')}`;
const EMOJI_ONE_REGEX_ESCAPED = `${Object.keys(convertMapEmojiOne)
  .map(HTMLEscape)
  .join('|')}`;

const EMOJI_CUSTOM_REGEX = (
  customEmojiMap: CustomEmojiMap,
  isEscaped: boolean,
) =>
  `:${
    isEscaped
      ? Object.keys(customEmojiMap)
          .map(HTMLEscape)
          .join(':|:')
      : Object.keys(customEmojiMap).join(':|:')
  }:`;

const EMOJI_ONE_PATH = '/emoji/emojione/png/{{unicode}}.png?v=2.2.7';

// modified from Markdown.global_url_regex
// tslint:disable-next-line:max-line-length
const URL_REGEX = /(([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\%\_\`\{\|\}\~\.]+@)?)(((ftp|https?):\/\/)?[-\w]+\.?([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?(((\/([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=])*)+)\??([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%])*)?)([^A-Za-z]|$)/gi;

export {
  isInRange,
  containsRange,
  hasIntersection,
  getComplementRanges,
  // isHTML,
  HTMLUnescape,
  HTMLEscape,
  EMOJI_ONE_PATH,
};

// regex
export {
  MATCH_ALL_REGEX,
  MATCH_NOTHING_REGEX,
  AT_MENTION_REGEX,
  AT_MENTION_ESCAPED,
  EMOJI_UNICODE_REGEX,
  EMOJI_UNICODE_REGEX_ESCAPED,
  EMOJI_ASCII_REGEX,
  EMOJI_ASCII_REGEX_ESCAPED,
  EMOJI_ONE_REGEX,
  EMOJI_ONE_REGEX_ESCAPED,
  EMOJI_CUSTOM_REGEX,
  URL_REGEX,
};
