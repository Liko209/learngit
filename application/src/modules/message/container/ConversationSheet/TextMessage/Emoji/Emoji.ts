/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 10:20:57
 * Copyright © RingCentral. All rights reserved.
 */

import { mapEmojiOne, mapSpecial, mapUnescape } from './map';
import {
  convertMapAscii,
  convertMapUnicode,
  regExpEmojiOne,
  regExpAscii,
  regExpUnicode,
  regExpSpecial,
  regExpUnescape,
} from './convertKeys';
import { CustomEmojiMap } from '../types';
import { mapUnicodeToShort } from './mapUnicodeToShort';

class Emoji {
  text: string;
  private _staticHttpServer: string;
  private _customEmojiMap: CustomEmojiMap;
  private _regExpCustom: RegExp;

  constructor(
    text: string,
    staticHttpServer: string,
    customEmojiMap: CustomEmojiMap,
  ) {
    // Note: about text value.
    // 1. Cannot be dissected with Glipdown, otherwise it will result in an XXS attack.
    // 2. The original value (Glipdown) cannot be changed through regular expression, otherwise the regular mismatch will be caused.
    this.text = text;
    this._staticHttpServer = staticHttpServer;
    this._customEmojiMap = customEmojiMap;
    this._regExpCustom = new RegExp(
      `:${Object.keys(customEmojiMap).join(':|:')}:`,
      'g',
    );
    // Notice we can't change the order
    this.formatUnicode(); // Img tag alt attribute is unicode
    this.formatAscii();
    this.formatCustom(); // Custom key and emojione key duplicate
    this.formatEmojiOne();
  }

  formatEmojiOne() {
    this.text = this.text.replace(regExpEmojiOne, (match: string) => {
      // console.log(match); // :smile:
      const obj = mapEmojiOne[match]; // :smile:
      if (obj instanceof Object) {
        const unicode = obj.fname;
        return this._getImg(match, unicode);
      }
      return match;
    });
    return this;
  }

  formatCustom() {
    this.text = this.text.replace(this._regExpCustom, (match: string) => {
      // console.log(match); // :rc:
      const obj = this._customEmojiMap[match.slice(1, -1)]; // rc
      if (obj instanceof Object) {
        return `<img class="${this._getClassName(match)}" src="${obj.data}" />`;
      }
      return match;
    });
    return this;
  }

  formatAscii() {
    return this.formatExactMatch(regExpAscii, convertMapAscii);
  }

  formatUnicode() {
    return this.formatExactMatch(regExpUnicode, convertMapUnicode);
  }

  formatExactMatch(regExp: RegExp, mapData: Object) {
    this.text = this.text.replace(regExp, (match: string) => {
      // console.log(match); // <3 🇭🇰 ⛹️
      // Note: Glipdown does not convert regular expression special characters
      const key = match
        .trim()
        .replace(regExpSpecial, (match: string) => mapSpecial[match]);
      let unicode = mapData[key]; // Temporary unicode
      // Look at the mapUnicodeToShort method for backend file emojione.js
      const shortName = mapUnicodeToShort[unicode];
      if (shortName) {
        unicode = mapEmojiOne[shortName].fname; // The actual unicode
      }
      return this._getImg(match, unicode);
    });
    return this;
  }

  private _getImg(match: string, unicode: string) {
    // Note: Convert to raw data
    const title = match.replace(
      regExpUnescape,
      (match: string) => mapUnescape[match],
    );
    return `<img class="${this._getClassName(match)}" alt="${this._getAlt(
      unicode,
    )}" title="${title}" src="${this._getSrc(unicode)}" />`;
  }

  private _getClassName(match: string) {
    let className = 'emoji';
    if (this.text.trim().length === match.length) {
      className += ' enlarge-emoji'; // only emoji
    }
    return className;
  }

  private _getSrc(unicode: string) {
    // const staticHttpServer = 'https://d2rbro28ib85bu.cloudfront.net';
    const path = '/emoji/emojione/png/';
    const param = '?v=2.2.7';
    return `${this._staticHttpServer}${path}${unicode}.png${param}`;
  }

  private _getAlt(unicode: string) {
    // ES6 implementation
    if (typeof unicode === 'string') {
      const params: number[] = unicode
        .split('-')
        .map((u: string) => parseInt(`0x${u}`, 16));
      return String.fromCodePoint(...params);
    }
    return unicode;
    // ES5 implementation (Glip back-end implementation)
    // if (unicode.indexOf('-') > -1) {
    //   const parts = [];
    //   const s = unicode.split('-');
    //   for (let i = 0; i < s.length; i++) {
    //     let part: string | number = parseInt(s[i], 16);
    //     if (part >= 0x10000 && part <= 0x10FFFF) {
    //       const hi = Math.floor((part - 0x10000) / 0x400) + 0xD800;
    //       const lo = ((part - 0x10000) % 0x400) + 0xDC00;
    //       part = (String.fromCharCode(hi) + String.fromCharCode(lo));
    //     } else {
    //       part = String.fromCharCode(part);
    //     }
    //     parts.push(part);
    //   }
    //   return parts.join('');
    // }
    // const s = parseInt(unicode, 16);
    // if (s >= 0x10000 && s <= 0x10FFFF) {
    //   const hi = Math.floor((s - 0x10000) / 0x400) + 0xD800;
    //   const lo = ((s - 0x10000) % 0x400) + 0xDC00;
    //   return (String.fromCharCode(hi) + String.fromCharCode(lo));
    // }
    // return String.fromCharCode(s);
  }
}

export { Emoji };
