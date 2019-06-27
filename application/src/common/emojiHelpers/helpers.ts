/*
 * @Author: Devin Lin (devin.lin@ringcen

  '/Users/ken.li/work/projects/Fiji/node_modules/@types/emoji-mart/dist-es/utils/data.d.ts';
 * @Date: 2018-11-07 10:27:20
 * Copyright © RingCentral. All rights r
 *
 * '/Users/ken.li/work/projects/Fiji/node_modules/@types/emoji-mart/dist-es/utils/data.d.ts';
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
  getEmojiDataFromUnicode,
};
