/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-24 09:46:55
 * Copyright © RingCentral. All rights reserved.
 */

import mapEmojiOne from './mapEmojiOne';
import mapAscii from './mapAscii';
import { CustomEmojiMap } from '../types';

function formatEmojiOne(text: string, staticHttpServer: string) {
  const regExp = /:([^:|^\/]+?):/g; // except http://
  return text.trim().replace(regExp, (match: string) => {
    // console.log(match, p1); // :abc: abc
    const obj = mapEmojiOne[match];
    if (obj instanceof Object) {
      const arr = obj.unicode;
      const unicode = arr[arr.length - 1];
      return getImg(text, match, unicode, staticHttpServer);
    }
    return match;
  });
}

function formatAscii(text: string, staticHttpServer: string) {
  // Regular expression special characters, Except '\', because mapAscii has used '\'
  const regExpEscape = /\$|\(|\)|\*|\+|\.|\[|\]|\?|\/|\^|\{|\}|\|/g;
  // Escape the key of mapAscii
  const asciiKeys = Object.keys(mapAscii).map((key: string) => {
    return key.replace(regExpEscape, (match: string) => {
      return `\\${match}`;
    });
  });
  // Only ascii character, an exact match
  const regExp = new RegExp(`^${asciiKeys.join('$|^')}$`, 'g');
  return text.trim().replace(regExp, (match: string) => {
    const unicode = mapAscii[match];
    if (unicode) {
      return getImg(text, match, unicode, staticHttpServer);
    }
    return match;
  });
}

function formatCustom(text: string, mapCustom: CustomEmojiMap) {
  const regExp = /:([^:|^\/]+?):/g; // except http://
  return text.trim().replace(regExp, (match: string, p1: string) => {
    // console.log(match, p1); // :abc: abc
    const obj = mapCustom[p1];
    if (obj instanceof Object) {
      return `<img class="${getClassName(text, match)}" src="${obj.data}">`;
    }
    return match;
  });
}

function getImg(text: string, match: string, unicode: string, staticHttpServer: string) {
  return `<img class="${getClassName(text, match)}" alt="${getAlt(unicode)}" title="${match}" src="${getSrc(unicode, staticHttpServer)}">`;
}

function getClassName(text: string, match: string) {
  let className = 'emoji';
  if (text.trim().length === match.length) {
    className += ' enlarge-emoji'; // only emoji
  }
  return className;
}

function getSrc(unicode: string, staticHttpServer: string) {
  // const staticHttpServer = 'https://d2rbro28ib85bu.cloudfront.net';
  const path = '/emoji/emojione/png/';
  const param = '?v=2.2.7';
  return `${staticHttpServer}${path}${unicode}.png${param}`;
}

function getAlt(unicode: string) {
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

export { formatEmojiOne, formatAscii, formatCustom };
