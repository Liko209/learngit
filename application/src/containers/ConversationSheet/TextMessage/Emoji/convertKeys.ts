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
    _key = _key.replace(regExpEscape, (match: string) => mapEscape[match]);
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
};
