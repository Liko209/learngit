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
  getEmojiDataFromUnicode,
} from '@/common/emojiHelpers';
import {
  EMOJI_UNICODE_REGEX,
  EMOJI_CUSTOM_REGEX,
  EMOJI_ONE_PATH,
  EMOJI_ONE_REGEX_SIMPLE,
  EMOJI_ASCII_REGEX_SIMPLE,
  b64EncodeUnicode,
  EMOJI_SKIN_TONE_CODES,
} from '../utils';
import data from 'emoji-mart/data/all.json';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { Company } from 'sdk/module/company/entity';
import CompanyModel from '@/store/models/Company';

class EmojiTransformer {
  static emojiDataMap = {};
  static replace(
    originalStr: string,
    options: EmojiTransformerOption,
    convertType: EmojiConvertType = 0,
  ) {
    const { unicodeOnly } = options;
    const reg = this.getRegexp(convertType);
    return originalStr.replace(reg, (_match: string, pre = '', emoji) => {
      const enlarge = emoji.length === originalStr.trim().length;
      const id = b64EncodeUnicode((unicodeOnly ? 'u' : '') + emoji + enlarge);
      if (this.emojiDataMap[id]) {
        return pre + this.getReplacePattern(id);
      }
      const obj = this.customEmojiMap[emoji.slice(1, -1)];

      if (
        !unicodeOnly &&
        convertType === EmojiConvertType.CUSTOM &&
        obj &&
        typeof obj === 'object' &&
        obj.data
      ) {
        const data = {
          className: this._getClassName(enlarge),
          src: obj.data,
          isCustomEmoji: true,
          isEnlarged: enlarge,
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
      const skinTone = this._hasSkinTone(unicode);

      if (unicodeOnly) {
        return pre + code;
      }
      const emojiName = this._transferUnicodeToEmojiData(unicode);

      const data = {
        className: this._getClassName(enlarge),
        alt: code,
        title: emoji,
        src: this._getSrc(unicode),
        isCustomEmoji: false,
        name: emojiName ? emojiName.id : '',
        tone: skinTone,
        isEnlarged: enlarge,
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
    convertType: EmojiConvertType,
  ) {
    const regexpMap = {
      [EmojiConvertType.UNICODE]: EMOJI_UNICODE_REGEX,
      [EmojiConvertType.ASCII]: EMOJI_ASCII_REGEX_SIMPLE,
      [EmojiConvertType.CUSTOM]: EMOJI_CUSTOM_REGEX(this.customEmojiMap),
      [EmojiConvertType.EMOJI_ONE]: EMOJI_ONE_REGEX_SIMPLE,
    };
    return new RegExp(regexpMap[convertType], 'gi');
  }

  private static _transferUnicodeToEmojiData(unicode: string) {
    const emojiData = getEmojiDataFromUnicode(unicode, data);
    const skinToneIndex = this._hasSkinTone(unicode);
    if (skinToneIndex > -1) {
      return getEmojiDataFromUnicode(
        unicode.replace(
          `-${EMOJI_SKIN_TONE_CODES[skinToneIndex - 1].toLowerCase()}`,
          '',
        ),
        data,
      );
    }
    return emojiData;
  }

  private static _hasSkinTone(unicode: string) {
    let toneCodeIndex: number = -1;
    EMOJI_SKIN_TONE_CODES.forEach((toneCode, index) => {
      if (unicode.toLowerCase().indexOf(toneCode.toLowerCase()) > -1) {
        toneCodeIndex = index + 1;
      }
    });
    return toneCodeIndex;
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

  private static _getSrc(unicode: string) {
    const hostName = getGlobalValue(GLOBAL_KEYS.STATIC_HTTP_SERVER);
    if (!hostName) {
      return '';
    }
    return hostName + EMOJI_ONE_PATH.replace('{{unicode}}', unicode);
  }

  static get customEmojiMap() {
    const currentCompanyId = getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
    if (currentCompanyId <= 0) {
      return {};
    }
    const company =
      getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, currentCompanyId) ||
      {};
    return company.customEmoji || {};
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
