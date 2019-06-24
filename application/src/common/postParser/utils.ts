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
} from '@/common/emojiHelpers';
import _ from 'lodash';
import moize from 'moize';

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
      const len = (nextRange ? nextRange.startIndex : fullLength) - start;
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

const getTopLevelChildNodesFromHTML = (_html: string) => {
  let html = _html;
  const reg = /(<td\b[^>]*>(?:(?!<\/td>).)*?)(<\/tr>)/g;
  // workaround for markdown bug
  if (html.includes('<td') && html.includes('</tr>') && reg.test(html)) {
    html = html.replace(new RegExp(reg), (match, g1, g2) => `${g1}</td>${g2}`);
  }
  const tagReg = /<([a-zA-Z0-9]*)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  const nodes = [];
  let result = tagReg.exec(html);
  let cursor = 0;
  while (result !== null) {
    const match = result[0];
    const tag = result[1];
    const attrs: { [attrName: string]: any } = {};
    const attrStr = result[2];
    if (attrStr) {
      const getKey = (seg: string) => {
        const key = seg.trim();
        return key === 'class' ? 'className' : key;
      };
      const getValue = (seg: string, key: string) => {
        let val: string | object = seg.trim();
        val = /^(['|"]).+\1$/.test(val) ? val.slice(1, -1) : val;
        if (key === 'style') {
          val = getStylesObject(val);
        }
        return val;
      };

      const attrKeyReg = /\s+([\w]+)=/g;
      let attrResult = attrKeyReg.exec(attrStr);
      let lastIndex = 0;
      while (attrResult !== null) {
        const key = getKey(attrResult[1]);
        lastIndex = attrResult.index + attrResult[0].length;
        attrResult = attrKeyReg.exec(attrStr);
        attrs[key] = getValue(
          attrStr.substring(
            lastIndex,
            attrResult ? attrResult.index : attrStr.length,
          ),
          key,
        );
      }
    }
    const index = result.index;
    if (cursor !== index) {
      nodes.push({
        substring: html.substring(cursor, index),
        isTag: false,
      });
    }
    nodes.push({
      tag,
      attrs,
      isTag: true,
      inner: result[3],
    });
    cursor = index + match.length;
    result = tagReg.exec(html);
  }
  if (cursor < html.length) {
    nodes.push({
      substring: html.substring(cursor, html.length),
      isTag: false,
    });
  }
  return nodes;
};

const getStylesObject = moize(
  (styles: string) =>
    styles
      .split(';')
      .filter(style => style.split(':')[0] && style.split(':')[1])
      .map(style => [
        style
          .split(':')[0]
          .trim()
          .replace(/-./g, c => c.substr(1).toUpperCase()),
        style.split(':')[1].trim(),
      ])
      .reduce(
        (styleObj, style) => ({
          ...styleObj,
          [style[0]]: style[1],
        }),
        {},
      ),
  {
    maxSize: 100,
    transformArgs: ([styles]) => [styles],
  },
);

const MATCH_ALL_REGEX = /^[\s\S]+$/g;
const MATCH_NOTHING_REGEX = /a^/g;
const AT_MENTION_REGEX = /<a class='at_mention_compose' rel='{"id":([-?\d]*?)}'>(.*?)<\/a>/gi;
const AT_MENTION_GROUPED_REGEXP = /(<a class='at_mention_compose' rel='{"id":[-?\d]*?}'>)(.*?)(<\/a>)/gi;
const MIN_ATMENTION_PATTERN_LENGTH = 48;

const EMOJI_REGEX = /<emoji data='([a-zA-Z0-9\+\/\=]+)' \/>/gi;
const MIN_EMOJI_PATTERN_LEN = 17;
const EMOJI_UNICODE_REGEX_RANGE =
  '\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]';
const EMOJI_UNICODE_REGEX = `${Object.keys(convertMapUnicode).join('|')}`;

const EMOJI_ASCII_REGEX = `(^|\\s)${Object.keys(convertMapAscii).join(
  '(?=\\s|$|[!,.?])|(^|\\s)',
)}(?=\\s|$|[!,.?])`;
const EMOJI_ASCII_REGEX_SIMPLE =
  "[<3\\/:'\\)-=\\]>;\\*\\^\\(xp\\[@\\.\\$#%O08_LÞþbdo]{2,}";

const EMOJI_ONE_REGEX = `${Object.keys(convertMapEmojiOne).join('|')}`;
const EMOJI_ONE_REGEX_SIMPLE = ':[a-z0-9\\+\\-\\_]+:';

const EMOJI_CUSTOM_REGEX = (customEmojiMap: CustomEmojiMap) =>
  `:${Object.keys(customEmojiMap).join(':|:')}:`;

const EMOJI_ONE_PATH = '/emoji/emojione/png/{{unicode}}.png?v=2.2.7';

// modified from Markdown.global_url_regex
// tslint:disable-next-line:max-line-length
const URL_REGEX = /(([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\%\_\`\{\|\}\~\.]+@)?)(((ftp|https?):\/\/)?[-\w]+\.?([-\w]+\.)*(\d+\.\d+\.\d+|[-A-Za-z]+)(:\d+)?(((\/([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=])*)+)\??([A-Za-z0-9-\._~:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%])*)?)([^A-Za-z]|$)/gi;

const VALID_PHONE_REG = /\+?(\d{1,4} ?)?((\(\d{1,4}\)|\d(( |\-)?\d){0,3})(( |\-)?\d){2,}|(\(\d{2,4}\)|\d(( |\-)?\d){1,3})(( |\-)?\d){1,})(( x| ext.?)\d{1,5}){0,1}/g;
const NUMBER_WITH_PLUS = 10;
const MIN_PHONE_NUMBER_LENGTH = 7;
const MAX_PHONE_NUMBER_LENGTH = 15;
const isValidPhoneNumber = (value: string) => {
  // const IS_PHONE_NUMBER = new RegExp(VALID_PHONE_REG).test(value);
  if (!value) return false;
  const noneSpecialChar = value.replace(/\+|\-|\(|\)|\s+/g, '');
  const phoneNumberLength = noneSpecialChar.length;
  if (value.indexOf('+') === 0) {
    return (
      phoneNumberLength >= NUMBER_WITH_PLUS &&
      phoneNumberLength <= MAX_PHONE_NUMBER_LENGTH
    );
  }
  return !(
    phoneNumberLength < MIN_PHONE_NUMBER_LENGTH ||
    phoneNumberLength > MAX_PHONE_NUMBER_LENGTH
  );
};

// first we use encodeURIComponent to get percent-encoded UTF-8,
// then we convert the percent encodings into raw bytes which
// can be fed into btoa.
const b64EncodeUnicode = (str: string) => btoa(encodeURIComponent(str));

// Going backwards: from bytestream, to percent-encoding, to original string.
const b64DecodeUnicode = (str: string) => decodeURIComponent(atob(str));

export {
  isInRange,
  containsRange,
  hasIntersection,
  getComplementRanges,
  // isHTML,
  HTMLUnescape,
  EMOJI_ONE_PATH,
  isValidPhoneNumber,
  b64EncodeUnicode,
  b64DecodeUnicode,
  getStylesObject,
  getTopLevelChildNodesFromHTML,
  MIN_EMOJI_PATTERN_LEN,
  NUMBER_WITH_PLUS,
  MIN_PHONE_NUMBER_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MIN_ATMENTION_PATTERN_LENGTH,
};

// regex
export {
  MATCH_ALL_REGEX,
  AT_MENTION_GROUPED_REGEXP,
  MATCH_NOTHING_REGEX,
  AT_MENTION_REGEX,
  EMOJI_REGEX,
  EMOJI_UNICODE_REGEX_RANGE,
  EMOJI_UNICODE_REGEX,
  EMOJI_ASCII_REGEX_SIMPLE,
  EMOJI_ASCII_REGEX,
  EMOJI_ONE_REGEX,
  EMOJI_CUSTOM_REGEX,
  URL_REGEX,
  VALID_PHONE_REG,
  EMOJI_ONE_REGEX_SIMPLE,
};
