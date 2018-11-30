/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-07 10:27:20
 * Copyright © RingCentral. All rights reserved.
 */

import { mapEscape, mapUnescape, mapSpecial, mapAscii, mapUnicode } from './map';

type MapData = {
  [index: string]: string;
};

const regExpEscape = new RegExp(Object.keys(mapEscape).join('|'), 'g');

const regExpUnescape = new RegExp(Object.keys(mapUnescape).join('|'), 'g');

const regExpSpecial = new RegExp(Object.keys(mapSpecial).map(key => mapSpecial[key]).join('|'), 'g');

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

// Regular expression for colon (EmojiOne, Custom)
const regExpColon = /:([^:]\S*?)(?=:)/g; // /(?<=:)(\S+?)(?=:)/g; /(?<=:)([^:]\S*?)(?=:)/g;

// Ascii keys regular expression
const regExpAscii = new RegExp(`(^|\\s)${Object.keys(convertMapAscii).join('(?!\\S)|(^|\\s)')}(?!\\S)`, 'g');

// Unicode keys regular expression
const regExpUnicode = new RegExp(`${Object.keys(convertMapUnicode).join('|')}`, 'g');

export {
  regExpEscape,
  regExpUnescape,
  regExpSpecial,
  convertMapAscii,
  convertMapUnicode,
  regExpColon,
  regExpAscii,
  regExpUnicode,
};
