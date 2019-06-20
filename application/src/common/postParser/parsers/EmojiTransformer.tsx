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
  EMOJI_ASCII_REGEX,
  EMOJI_CUSTOM_REGEX,
  EMOJI_ONE_REGEX,
  EMOJI_ONE_PATH,
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

    return originalStr.replace(
      this.getRegexp(options, convertType),
      (_match: string) => {
        const match = _match.trim();
        const enlarge = match.length === originalStr.trim().length;
        const obj = customEmojiMap[match.slice(1, -1)];
        const id = Date.now() + b64EncodeUnicode(_match);
        if (
          convertType === EmojiConvertType.CUSTOM &&
          obj &&
          typeof obj === 'object' &&
          obj.data
        ) {
          const data = {
            className: this._getClassName(match, enlarge),
            src: obj.data,
          };
          this.emojiDataMap[id] = data;
          return `<emoji data='${id}' />`;
        }
        if (convertType === EmojiConvertType.CUSTOM) {
          return match;
        }
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

        const data = {
          className: this._getClassName(match, enlarge),
          alt: code,
          title: match,
          src: this._getSrc(unicode, hostName),
        };
        this.emojiDataMap[id] = data;
        return `<emoji data='${id}' />`;
      },
    );
  }

  static getRegexp(
    options: EmojiTransformerOption,
    convertType: EmojiConvertType,
  ) {
    const { customEmojiMap = {} } = options;
    const regexpMap = {
      [EmojiConvertType.UNICODE]: EMOJI_UNICODE_REGEX,
      [EmojiConvertType.ASCII]: EMOJI_ASCII_REGEX,
      [EmojiConvertType.CUSTOM]: EMOJI_CUSTOM_REGEX(customEmojiMap),
      [EmojiConvertType.EMOJI_ONE]: EMOJI_ONE_REGEX,
    };
    return new RegExp(regexpMap[convertType], 'g');
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

  private static _getClassName(match: string, enlarge: boolean) {
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
