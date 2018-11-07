/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:07:25
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { Emoji } from '../../Emoji';
import { mapEmojiOne, mapAscii, mapUnicode } from '../../Emoji/map';

const staticHttpServer = 'https://www.abc.com/a/b';
const customEmojiMap = {
  rc: { data: 'https://www.123.com/a/rc.png' },
  att: { data: 'https://www.123.com/a/att.png' },
};
const arrNotMatch = [':xyz:', ':zyx:'];

function format(text: string) {
  const markdown = Markdown(text);
  const emoji = new Emoji(markdown, staticHttpServer, customEmojiMap);
  // console.log(`markdown: ${markdown}, result: ${emoji.text}`);
  return emoji.text;
}

describe('Format one kind emoji, only one kind emoji, has specific class name', () => {
  const CLASS_NAME = 'enlarge-emoji';
  const getRegExp = (unicode: string) => new RegExp(`^<img.+?${CLASS_NAME}.+?${unicode}\.png[^>]+?>$`);
  const _runAll = (mapOriginalData: object) => {
    Object.keys(mapOriginalData).forEach((originKey: string) => {
      const result = format(originKey);
      const unicode = mapOriginalData[originKey];
      expect(result).toMatch(getRegExp(unicode));
    });
  };

  it('All EmojiOne', async () => {
    _runAll(mapEmojiOne);
  });

  it('All Ascii', async () => {
    _runAll(mapAscii);
  });

  it('All Unicode', async () => {
    _runAll(mapUnicode);
  });

  it('All Custom', async () => {
    const map = {};
    for (const key in customEmojiMap) {
      map[`:${key}:`] = customEmojiMap[key];
    }
    _runAll(map);
  });

  it('All Not match', async () => {
    arrNotMatch.forEach((originKey: string) => {
      const result = format(originKey);
      const regExp = new RegExp(`^${originKey}$`);
      expect(result).toMatch(regExp);
    });
  });
});

describe('format multiple kind emoji', () => {
  it('EmojiOne + Ascii + Unicode + Custom + Not match ', async () => {
    const keys = [':smile:', ':cry:', '<3', ':D', ':rc:', ':att:', ':xxx:', ':yyy:', '🇭🇰', '🌶'];
    const left = 'abc';
    const right = '123';

    const result = format(`${left}${keys.join('')}${right}`);
    const unicode0 = mapEmojiOne[keys[0]].fname;
    const unicode1 = mapEmojiOne[keys[1]].fname;
    const unicode8 = mapUnicode[keys[8]];
    const unicode9 = mapUnicode[keys[9]];
    const src4 = customEmojiMap.rc.data;
    const src5 = customEmojiMap.att.data;
    const regExpEmojiOne0 = `<img[^>]+?${unicode0}\.png[^>]+?>`;
    const regExpEmojiOne1 = `<img[^>]+?${unicode1}\.png[^>]+?>`;
    const regExpCustom4 = `<img[^>]+?${src4}[^>]+?>`;
    const regExpCustom5 = `<img[^>]+?${src5}[^>]+?>`;
    const regExpUnicode8 = `<img[^>]+?${unicode8}\.png[^>]+?>`;
    const regExpUnicode9 = `<img[^>]+?${unicode9}\.png[^>]+?>`;
    const key2 = Markdown(keys[2]);
    const key3 = Markdown(keys[3]);

    const regExp = new RegExp(`^${left}${regExpEmojiOne0}${regExpEmojiOne1}${key2}${key3}${regExpCustom4}${regExpCustom5}${keys[6]}${keys[7]}${regExpUnicode8}${regExpUnicode9}${right}$`);
    expect(result).toMatch(regExp);
  });
  // 'abc:smile::cry:<3:D:rc::att::xxx::yyy123:'.match()
});

  // const keysEmojiOne = Object.keys(mapEmojiOne);
  // const keysAscii = ['<3', '</3', ':\')', '*)']; // Object.keys(mapAscii); // Cannot all merge parsing, :b d: *-) *)
  // const keysUnicode = Object.keys(mapUnicode);
  // const keysCustom = Object.keys(customEmojiMap).map((key: string) => `:${key}:`);
  // const keysNotMatch = arrNotMatch;

  // const keys = [...keysEmojiOne, ...keysAscii, ...keysUnicode, ...keysCustom, ...keysNotMatch];

  // const result = format(keys.join(''));

  // const emojiOneImg = keysEmojiOne.map((key: string) => {
  //   const obj = mapEmojiOne[key];
  //   if (obj instanceof Object) {
  //     const arr = obj.unicode;
  //     const unicode = arr[arr.length - 1];
  //     return `<img.+?${unicode}\.png[^>]+?>`;
  //   }
  //   return key;
  // }).join('');
  // const asciiText = keysAscii.join('').replace(regExpEscape, (match: string) => mapEscape[match]).replace(regExpSpecial, (match: string) => mapSpecial[match]);

  // const unicodeImg = keysEmojiOne.map((key: string) => {
  //   const unicode = mapUnicode[key];
  //   return `<img.+?${unicode}\.png[^>]+?>`;
  // }).join('');
  // const customImg = Object.keys(customEmojiMap).map((key: string) => {
  //   const src = customEmojiMap[key].data;
  //   return `<img.+?${src}[^>]+?>`;
  // }).join('');
  // const notMatchText = keysNotMatch.join('');

  // const regExp = new RegExp(`${unicodeImg}`);
  // expect(result).toMatch(regExp);
