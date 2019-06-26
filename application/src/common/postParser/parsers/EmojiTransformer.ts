/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 11:39:51
 * Copyright © RingCentral. All rights reserved.
 */
import { EmojiTransformerOption, EmojiConvertType } from '../types';
import moize from 'moize';
import {
  convertMapUnicode,
  convertMapAscii,
  regExpSpecial,
  mapUnicodeToShort,
  mapEmojiOne,
  mapSpecial,
} from '@/common/emojiHelpers';
import {
  EMOJI_UNICODE_REGEX,
  EMOJI_CUSTOM_REGEX,
  EMOJI_ONE_PATH,
  EMOJI_ONE_REGEX_SIMPLE,
  EMOJI_ASCII_REGEX_SIMPLE,
  b64EncodeUnicode,
} from '../utils';

class EmojiTransformer {
  static emojiDataMap = {};
  static replace(
    originalStr: string,
    options: EmojiTransformerOption,
    convertType: EmojiConvertType = 0,
  ) {
    const { customEmojiMap = {}, unicodeOnly, hostName } = options;
    const reg = this.getRegexp(options, convertType);
    return originalStr.replace(reg, (_match: string, pre = '', emoji) => {
      const enlarge = emoji.length === originalStr.trim().length;
      const id = b64EncodeUnicode(emoji + enlarge);
      if (this.emojiDataMap[id]) {
        return pre + this.getReplacePattern(id);
      }
      const obj = customEmojiMap[emoji.slice(1, -1)];

      if (
        convertType === EmojiConvertType.CUSTOM &&
        obj &&
        typeof obj === 'object' &&
        obj.data
      ) {
        const data = {
          className: this._getClassName(enlarge),
          src: obj.data,
        };
        return pre + this.getReplacePattern(id, data);
      }
      if (convertType === EmojiConvertType.CUSTOM) {
        return _match;
      }

      const key =
        convertType === EmojiConvertType.ASCII
          ? emoji.replace(regExpSpecial, (match: string) => mapSpecial[match])
          : emoji;
      const mapMap = {
        [EmojiConvertType.UNICODE]: convertMapUnicode,
        [EmojiConvertType.ASCII]: convertMapAscii,
        [EmojiConvertType.EMOJI_ONE]: mapEmojiOne,
      };
      const mapValue = mapMap[convertType][key];
      if (!mapValue) {
        return _match;
      }

      const shortName = mapUnicodeToShort[mapValue];
      const unicode =
        mapValue instanceof Object
          ? mapValue.fname
          : shortName
          ? mapEmojiOne[shortName].fname
          : mapValue;
      const code = this._convertFromCodePoint(unicode);

      if (unicodeOnly || !hostName) {
        return pre + code;
      }

      const data = {
        className: this._getClassName(enlarge),
        alt: code,
        title: emoji,
        src: this._getSrc(unicode, hostName),
      };
      return pre + this.getReplacePattern(id, data);
    });
  }

  static getReplacePattern(id: string, data?: {}) {
    if (data) {
      this.emojiDataMap[id] = data;
    }
    return ` <emoji data='${id}' />`;
  }

  static getRegexp(
    options: EmojiTransformerOption,
    convertType: EmojiConvertType,
  ) {
    const { customEmojiMap = {} } = options;
    const regexpMap = {
      [EmojiConvertType.UNICODE]: EMOJI_UNICODE_REGEX,
      [EmojiConvertType.ASCII]: EMOJI_ASCII_REGEX_SIMPLE,
      [EmojiConvertType.CUSTOM]: EMOJI_CUSTOM_REGEX(customEmojiMap),
      [EmojiConvertType.EMOJI_ONE]: EMOJI_ONE_REGEX_SIMPLE,
    };
    return new RegExp(regexpMap[convertType], 'gi');
  }

  private static _convertFromCodePoint(unicode: string) {
    if (typeof unicode === 'string') {
      const params: number[] = unicode
        .split('-')
        .map((u: string) => parseInt(`0x${u}`, 16));
      return String.fromCodePoint(...params);
    }
    return unicode;
  }

  private static _getClassName(enlarge: boolean) {
    return enlarge ? 'emoji enlarge-emoji' : 'emoji';
  }

  private static _getSrc(unicode: string, hostName?: string) {
    if (!hostName) {
      return '';
    }
    return hostName + EMOJI_ONE_PATH.replace('{{unicode}}', unicode);
  }
}

EmojiTransformer.replace = moize(EmojiTransformer.replace, {
  maxSize: 100,
  transformArgs: ([originalStr, options, convertType]) => [
    originalStr,
    convertType,
    options.unicodeOnly,
  ],
});

export { EmojiTransformer };
