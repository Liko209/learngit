/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-07 10:27:20
 * Copyright © RingCentral. All rights reserved.
 */

import {
  mapEscape,
  mapUnescape,
  mapSpecial,
  mapAscii,
  mapUnicode,
  mapEmojiOne,
} from './map';

type EmojiOne = {
  unicode: string[];
  fname: string;
  uc: string;
  isCanonical: boolean;
};

type MapData = {
  [index: string]: string | EmojiOne;
};

const mapping = {
  name: 'a',
  unified: 'b',
  non_qualified: 'c',
  has_img_apple: 'd',
  has_img_google: 'e',
  has_img_twitter: 'f',
  has_img_emojione: 'g',
  has_img_facebook: 'h',
  has_img_messenger: 'i',
  keywords: 'j',
  sheet: 'k',
  emoticons: 'l',
  text: 'm',
  short_names: 'n',
  added_in: 'o',
};

const regExpEscape = new RegExp(Object.keys(mapEscape).join('|'), 'g');

const regExpUnescape = new RegExp(Object.keys(mapUnescape).join('|'), 'g');

const regExpSpecial = new RegExp(
  Object.keys(mapSpecial)
    .map(key => mapSpecial[key])
    .join('|'),
  'g',
);

const convertKeys = (mapData: MapData): MapData => {
  const map = {};
  for (const key in mapData) {
    let _key = key;
    // It is required after the Glipdown transformation, For example, < ' ...
    // _key = _key.replace(regExpEscape, (match: string) => mapEscape[match]);
    // Regular expressions need it, For example, / \ $ ( ) [ ] ^ ...
    _key = _key.replace(regExpSpecial, (match: string) => mapSpecial[match]);
    map[_key] = mapData[key];
  }
  return map;
};

const convertMapAscii = convertKeys(mapAscii);

const convertMapUnicode = convertKeys(mapUnicode);

// :+1_tone5:
const convertMapEmojiOne = convertKeys(mapEmojiOne);

// Regular expression for colon (EmojiOne, Custom)
// because safari 10 compatibility, https://stackoverflow.com/questions/3569104/positive-look-behind-in-javascript-regular-expression
// const regExpColon = /:(\S*?)(?=:)/g; // /(?<=:)(\S+?)(?=:)/g; /(?<=:)([^:]\S*?)(?=:)/g;

// EmojiOne keys regular expression
const regExpEmojiOne = new RegExp(
  `${Object.keys(convertMapEmojiOne).join('|')}`,
  'g',
);

// Ascii keys regular expression
// Refer to the emojione.js code regAscii regular expressions for backend
const regExpAscii = new RegExp(
  `(^|\\s)${Object.keys(convertMapAscii).join(
    '(?=\\s|$|[!,.?])|(^|\\s)',
  )}(?=\\s|$|[!,.?])`,
  'g',
);

// Unicode keys regular expression
const regExpUnicode = new RegExp(
  `${Object.keys(convertMapUnicode).join('|')}`,
  'g',
);

// {

//   "2694-fe0f": ":crossed_swords:",
//   "2694":":crossed_swords:"
// }
const mapUnicodeToShort = {};

for (const key in mapEmojiOne) {
  const arr = mapEmojiOne[key].unicode;
  for (let i = 0, len = arr.length; i < len; i++) {
    const unicode = arr[i];
    mapUnicodeToShort[unicode] = key;
  }
}

const getEmojiDataFromUnicode = (nativeString: string, data: any) => {
  if (data.compressed) {
    uncompress(data);
  }

  const skinTones = ['🏻', '🏼', '🏽', '🏾', '🏿'];
  const skinCodes = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];

  let skin;
  let skinCode: string = '1F3FC';
  const baseNativeString = nativeString;

  skinTones.forEach((skinTone, skinToneIndex) => {
    if (nativeString.indexOf(skinTone) > 0) {
      skin = skinToneIndex + 2;
      skinCode = skinCodes[skinToneIndex];
    }
  });

  let emojiData;
  for (const id in data.emojis) {
    const emoji = data.emojis[id];

    let emojiUnified = emoji.unified;

    if (emoji.variations && emoji.variations.length) {
      emojiUnified = emoji.variations.shift();
    }

    if (skin && emoji.skin_variations && emoji.skin_variations[skinCode]) {
      emojiUnified = emoji.skin_variations[skinCode].unified;
    }

    if (
      emojiUnified.toLowerCase().indexOf(baseNativeString.toLowerCase()) > -1
    ) {
      emojiData = emoji;
    }
  }
  if (!emojiData) {
    return null;
  }
  emojiData.id = emojiData.short_names[0];

  emojiData = sanitize(emojiData, data);

  return emojiData;
};

const sanitize = (emoji: any, data: any) => {
  let emojiData: any;
  if (emoji.id) {
    if (data.aliases.hasOwnProperty(emoji.id)) {
      emoji.id = data.aliases[emoji.id];
    }

    if (data.emojis.hasOwnProperty(emoji.id)) {
      emojiData = data.emojis[emoji.id];
    }
    if (emojiData) {
      emojiData = emoji;
    }
  }
  return emojiData;
};

const unifiedToNative = (unified: string) => {
  const unicodes = unified.split('-');
  const codePoints = unicodes.map(u => `0x${u}`);

  return stringFromCodePoint.apply(null, codePoints);
};

const stringFromCodePoint = function () {
  const MAX_SIZE = 0x4000;
  const codeUnits = [];
  let highSurrogate;
  let lowSurrogate;
  let index = -1;
  const length = arguments.length;
  if (!length) {
    return '';
  }
  let result = '';
  while (++index < length) {
    let codePoint = Number(arguments[index]);
    if (
      !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
      codePoint < 0 || // not a valid Unicode code point
      codePoint > 0x10ffff || // not a valid Unicode code point
      Math.floor(codePoint) !== codePoint // not an integer
    ) {
      throw RangeError(`Invalid code point: ${codePoint}`);
    }
    if (codePoint <= 0xffff) {
      // BMP code point
      codeUnits.push(codePoint);
    } else {
      // Astral code point; split in surrogate halves
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      codePoint -= 0x10000;
      highSurrogate = (codePoint >> 10) + 0xd800;
      lowSurrogate = (codePoint % 0x400) + 0xdc00;
      codeUnits.push(highSurrogate, lowSurrogate);
    }
    if (index + 1 === length || codeUnits.length > MAX_SIZE) {
      result += String.fromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }
  }
  return result;
};

const uncompress = (data: any) => {
  data.compressed = false;

  for (const id in data.emojis) {
    const emoji = data.emojis[id];

    for (const key in mapping) {
      emoji[key] = emoji[mapping[key]];
      delete emoji[mapping[key]];
    }

    if (!emoji.short_names) emoji.short_names = [];
    emoji.short_names.unshift(id);

    emoji.sheet_x = emoji.sheet[0];
    emoji.sheet_y = emoji.sheet[1];
    delete emoji.sheet;

    if (!emoji.text) emoji.text = '';

    if (!emoji.added_in) emoji.added_in = 6;
    emoji.added_in = emoji.added_in.toFixed(1);
  }
};

export {
  MapData,
  EmojiOne,
  regExpEscape,
  regExpUnescape,
  regExpSpecial,
  convertMapAscii,
  convertMapUnicode,
  convertMapEmojiOne,
  regExpAscii,
  regExpUnicode,
  regExpEmojiOne,
  mapUnicodeToShort,
  stringFromCodePoint,
  getEmojiDataFromUnicode,
  unifiedToNative,
};
