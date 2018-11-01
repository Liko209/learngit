/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 10:20:57
 * Copyright © RingCentral. All rights reserved.
 */

import mapEmojiOne from './mapEmojiOne';
import mapAscii from './mapAscii';
import mapUnicode from './mapUnicode';
import { CustomEmojiMap } from '../types';
import getEscapeKeys from './getEscapeKeys';

// Regular expression for colon (EmojiOne, Custom)
const regExpColon = /:([^:]\S*?)(?=:)/g; // /(?<=:)(\S+?)(?=:)/g; /(?<=:)([^:]\S*?)(?=:)/g;

// Ascii keys regular expression, only ascii character, an exact match
const regExpAscii = new RegExp(`^${getEscapeKeys(Object.keys(mapAscii)).join('$|^')}$`, 'g');

// Unicode keys regular expression
const regExpUnicode = new RegExp(`${getEscapeKeys(Object.keys(mapUnicode)).join('|')}`, 'g');

class Emoji {
  text: string;
  private _staticHttpServer: string;
  private _customEmojiMap: CustomEmojiMap;

  constructor(text: string, staticHttpServer: string, customEmojiMap: CustomEmojiMap) {
    this.text = text;
    this._staticHttpServer = staticHttpServer;
    this._customEmojiMap = customEmojiMap;
    this.formatUnicode();
    this.formatAscii();
    this.formatEmojiOne();
    this.formatCustom();
  }

  formatEmojiOne() {
    this.text = this.text.trim().replace(regExpColon, (match: string) => {
      // console.log(match); // :smile
      const obj = mapEmojiOne[`${match}:`]; // :smile:
      if (obj instanceof Object) {
        const arr = obj.unicode;
        const unicode = arr[arr.length - 1];
        return this._getImg(`${match}:`, unicode);
      }
      return match;
    });
    this._replaceImg();
    return this;
  }

  formatCustom() {
    this.text = this.text.trim().replace(regExpColon, (match: string) => {
      // console.log(match); // :rc
      const obj = this._customEmojiMap[match.slice(1)]; // rc
      if (obj instanceof Object) {
        return `<img class="${this._getClassName(`${match}:`)}" src="${obj.data}">`;
      }
      return match;
    });
    this._replaceImg();
    return this;
  }

  formatAscii() {
    return this.formatExactMatch(regExpAscii, mapAscii);
  }

  formatUnicode() {
    return this.formatExactMatch(regExpUnicode, mapUnicode);
  }

  formatExactMatch(regExp: RegExp, mapData: Object) {
    this.text = this.text.trim().replace(regExp, (match: string) => {
      // console.log(match); // <3  🇭🇰
      const unicode = mapData[match];
      return this._getImg(match, unicode);
    });
    return this;
  }

  private _replaceImg() {
    this.text = this.text.replace(/(<img[^>]+?>):/g, (match: string, img: string) => img);
  }

  private _getImg(match: string, unicode: string) {
    return `<img class="${this._getClassName(match)}" alt="${this._getAlt(unicode)}" title="${match}" src="${this._getSrc(unicode)}">`;
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
    const params: number[] = unicode.split('-').map((u: string) => parseInt(`0x${u}`, 16));
    return String.fromCodePoint(...params);
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
