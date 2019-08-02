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
const hasOwnProperty = Object.prototype.hasOwnProperty;
const regExpEscape = new RegExp(Object.keys(mapEscape).join('|'), 'g');

const regExpUnescape = new RegExp(Object.keys(mapUnescape).join('|'), 'g');

const regExpSpecial = new RegExp(
  Object.keys(mapSpecial)
    .map(key => mapSpecial[key])
    .join('|'),
  'g',
);

const isMatch = (
  emojiUnified: string,
  baseNativeString: string,
  emojiNonQualified?: string,
) => {
  return (
    emojiUnified.toLowerCase() === baseNativeString.toLowerCase() ||
    (emojiNonQualified &&
      emojiNonQualified.toLowerCase() === baseNativeString.toLowerCase())
  );
};
const sanitize = (emoji: any, data: any) => {
  let emojiData: any;
  if (emoji.id) {
    if (hasOwnProperty.call(data.aliases, emoji.id)) {
      emoji.id = data.aliases[emoji.id];
    }

    if (hasOwnProperty.call(data.emojis, emoji.id)) {
      emojiData = data.emojis[emoji.id];
    }
    if (emojiData) {
      emojiData = emoji;
    }
  }
  return emojiData;
};
const convertKeys = (mapData: MapData): MapData => {
  const map = {};
  for (const key in mapData) {
    if (hasOwnProperty.call(mapData, key)) {
      let _key = key;
      // It is required after the Glipdown transformation, For example, < ' ...
      // _key = _key.replace(regExpEscape, (match: string) => mapEscape[match]);
      // Regular expressions need it, For example, / \ $ ( ) [ ] ^ ...
      _key = _key.replace(regExpSpecial, (match: string) => mapSpecial[match]);
      map[_key] = mapData[key];
    }
  }
  return map;
};

const convertMapAscii = convertKeys(mapAscii);

const convertMapUnicode = convertKeys(mapUnicode);

// :+1_tone5:
// const convertMapEmojiOne = convertKeys(mapEmojiOne);

// Regular expression for colon (EmojiOne, Custom)
// because safari 10 compatibility, https://stackoverflow.com/questions/3569104/positive-look-behind-in-javascript-regular-expression
// const regExpColon = /:(\S*?)(?=:)/g; // /(?<=:)(\S+?)(?=:)/g; /(?<=:)([^:]\S*?)(?=:)/g;

// EmojiOne keys regular expression
// const regExpEmojiOne = new RegExp(
//   `${Object.keys(convertMapEmojiOne).join('|')}`,
//   'g',
// );

// Ascii keys regular expression
// Refer to the emojione.js code regAscii regular expressions for backend
// const regExpAscii = new RegExp(
//   `(^|\\s)${Object.keys(convertMapAscii).join(
//     '(?=\\s|$|[!,.?])|(^|\\s)',
//   )}(?=\\s|$|[!,.?])`,
//   'g',
// );

// Unicode keys regular expression
// const regExpUnicode = new RegExp(
//   `${Object.keys(convertMapUnicode).join('|')}`,
//   'g',
// );

// {

//   "2694-fe0f": ":crossed_swords:",
//   "2694":":crossed_swords:"
// }
const mapUnicodeToShort = {};

for (const key in mapEmojiOne) {
  if (hasOwnProperty.call(mapEmojiOne, key)) {
    const arr = mapEmojiOne[key].unicode;
    for (let i = 0, len = arr.length; i < len; i++) {
      const unicode = arr[i];
      mapUnicodeToShort[unicode] = key;
    }
  }
}

const getEmojiDataFromUnicode = (nativeString: string, data: any) => {
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
    if (hasOwnProperty.call(data.emojis, id)) {
      const emoji = data.emojis[id];

      let emojiUnified = emoji.unified;
      const emojiNonQualified = emoji.non_qualified;

      if (emoji.variations && emoji.variations.length) {
        emojiUnified = emoji.variations.shift();
      }

      if (skin && emoji.skin_variations && emoji.skin_variations[skinCode]) {
        emojiUnified = emoji.skin_variations[skinCode].unified;
      }

      if (isMatch(emojiUnified, baseNativeString, emojiNonQualified)) {
        emojiData = emoji;
      }
    }
  }
  if (!emojiData) {
    return null;
  }
  emojiData.id = emojiData.short_names[0];

  emojiData = sanitize(emojiData, data);

  return emojiData;
};

export {
  MapData,
  EmojiOne,
  regExpEscape,
  regExpUnescape,
  regExpSpecial,
  convertMapAscii,
  convertMapUnicode,
  // convertMapEmojiOne,
  // regExpAscii,
  // regExpUnicode,
  // regExpEmojiOne,
  mapUnicodeToShort,
  getEmojiDataFromUnicode,
};
