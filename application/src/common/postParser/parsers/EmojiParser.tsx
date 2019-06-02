/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 11:39:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  IPostParser,
  ParserType,
  EmojiParserOption,
  EmojiConvertType,
} from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import {
  convertMapUnicode,
  convertMapAscii,
  regExpSpecial,
  mapUnicodeToShort,
  mapEmojiOne,
  mapSpecial,
} from '@/common/emojiHelpers';
import {
  MATCH_NOTHING_REGEX,
  EMOJI_UNICODE_REGEX,
  EMOJI_ASCII_REGEX,
  EMOJI_CUSTOM_REGEX,
  EMOJI_ONE_REGEX,
  EMOJI_ONE_PATH,
  HTMLUnescape,
  EMOJI_UNICODE_REGEX_ESCAPED,
  EMOJI_ASCII_REGEX_ESCAPED,
  EMOJI_ONE_REGEX_ESCAPED,
} from '../utils';

class EmojiParser extends PostParser implements IPostParser {
  type = ParserType.EMOJI;
  ignoredRangeTypes = [ParserType.AT_MENTION, ParserType.EMOJI];
  content: ParseContent;
  constructor(public options: EmojiParserOption) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    const {
      customEmojiMap,
      unicodeOnly,
      convertType,
      hostName,
      isEscaped,
    } = this.options;
    if (convertType === EmojiConvertType.CUSTOM) {
      if (customEmojiMap && !unicodeOnly) {
        const obj = customEmojiMap[strValue.slice(1, -1)];
        if (obj && typeof obj === 'object' && obj.data) {
          return (
            <img className={this._getClassName(strValue)} src={obj.data} />
          );
        }
        return strValue;
      }
      return strValue;
    }
    const match = isEscaped ? HTMLUnescape(strValue.trim()) : strValue.trim();
    const key =
      convertType === EmojiConvertType.ASCII
        ? match.replace(regExpSpecial, (match: string) => mapSpecial[match])
        : match;
    const mapMap = {
      [EmojiConvertType.UNICODE]: convertMapUnicode,
      [EmojiConvertType.ASCII]: convertMapAscii,
      [EmojiConvertType.EMOJI_ONE]: mapEmojiOne,
    };
    const mapValue = mapMap[convertType][key];
    let unicode = mapValue;
    if (mapValue instanceof Object) {
      unicode = mapValue.fname;
    } else {
      const shortName = mapUnicodeToShort[unicode];
      if (shortName) {
        unicode = mapEmojiOne[shortName].fname; // The actual unicode
      }
    }
    const code = this._convertFromCodePoint(unicode);
    if (unicodeOnly || !hostName) {
      return code;
    }

    return (
      <img
        className={this._getClassName(match)}
        alt={code}
        title={match}
        src={this._getSrc(unicode)}
      />
    );
  }

  getRegexp() {
    const { customEmojiMap, convertType, isEscaped = false } = this.options;
    const regexpMap = {
      [EmojiConvertType.UNICODE]: new RegExp(
        isEscaped ? EMOJI_UNICODE_REGEX_ESCAPED : EMOJI_UNICODE_REGEX,
        'g',
      ),
      [EmojiConvertType.ASCII]: new RegExp(
        isEscaped ? EMOJI_ASCII_REGEX_ESCAPED : EMOJI_ASCII_REGEX,
        'g',
      ),
      [EmojiConvertType.CUSTOM]:
        customEmojiMap && Object.keys(customEmojiMap).length
          ? new RegExp(EMOJI_CUSTOM_REGEX(customEmojiMap, isEscaped), 'g')
          : new RegExp(MATCH_NOTHING_REGEX), // matches nothing
      [EmojiConvertType.EMOJI_ONE]: new RegExp(
        isEscaped ? EMOJI_ONE_REGEX_ESCAPED : EMOJI_ONE_REGEX,
        'g',
      ),
    };
    return regexpMap[convertType];
  }

  private _convertFromCodePoint(unicode: string) {
    if (typeof unicode === 'string') {
      const params: number[] = unicode
        .split('-')
        .map((u: string) => parseInt(`0x${u}`, 16));
      return String.fromCodePoint(...params);
    }
    return unicode;
  }

  private _getClassName(match: string) {
    let className = 'emoji';
    if (this.content.getOriginalStr().trim().length === match.length) {
      className += ' enlarge-emoji'; // only emoji
    }
    return className;
  }

  private _getSrc(unicode: string) {
    if (!this.options.hostName) {
      return '';
    }
    return (
      this.options.hostName + EMOJI_ONE_PATH.replace('{{unicode}}', unicode)
    );
  }
}

export { EmojiParser };
