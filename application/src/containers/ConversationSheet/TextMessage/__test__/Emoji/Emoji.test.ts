/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:07:25
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { Emoji } from '../../Emoji';
import { mapEmojiOne, mapAscii, mapUnicode } from '../../Emoji/map';
import { mapUnicodeToShort } from '../../Emoji/mapUnicodeToShort';

const staticHttpServer = 'https://www.emojione.com/';
const customEmojiMap = {
  rc: { data: 'https://www.custom.com/rc.png' },
  att: { data: 'https://www.custom.com/att.png' },
  horse: { data: 'https://www.custom.com/horse.png' },
};
const arrNotMatch = [':xyz:', ':zyx:'];

function format(text: string) {
  const markdown = Markdown(text);
  const emoji = new Emoji(markdown, staticHttpServer, customEmojiMap);
  // console.log(`markdown: ${markdown}, result: ${emoji.text}`);
  return emoji.text;
}

describe('Format one kind emoji', () => {
  const CLASS_NAME = 'enlarge-emoji';
  const getRegExp = (unicode: string) =>
    new RegExp(`^<img.+?${CLASS_NAME}.+?${unicode}[^>]+?>$`);
  const _runAll = (mapOriginalData: object) => {
    Object.keys(mapOriginalData).forEach((originKey: string) => {
      const result = format(originKey);
      let unicode = mapOriginalData[originKey]; // Temporary unicode
      const shortName = mapUnicodeToShort[unicode];
      if (shortName) {
        unicode = mapEmojiOne[shortName].fname; // The actual unicode
      }
      expect(result).toMatch(getRegExp(unicode));
    });
  };

  it('should be a img tag when input every emojiOne key', async () => {
    _runAll(mapEmojiOne);
  });

  it('should be a img tag when input every ascii key', async () => {
    _runAll(mapAscii);
  });

  it('should be a img tag when input every unicode key', async () => {
    _runAll(mapUnicode);
  });

  it('should be a img tag when input every custom key', async () => {
    const map = {};
    for (const key in customEmojiMap) {
      map[`:${key}:`] = customEmojiMap[key].data;
    }
    _runAll(map);
  });

  it('should be not a img tag when input every not match key', async () => {
    arrNotMatch.forEach((originKey: string) => {
      const result = format(originKey);
      const regExp = new RegExp(`^${originKey}$`);
      expect(result).toMatch(regExp);
    });
  });
});

describe('format multiple kind emoji', () => {
  it('should be match regular expressions when mixture emojiOne and ascii and unicode and custom and not match key', async () => {
    const keys = [
      ':smile:',
      ':cry:',
      '<3',
      ':D',
      ':rc:',
      ':att:',
      ':xxx:',
      ':yyy:',
      '🇭🇰',
      '🌶',
    ];
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

    const regExp = new RegExp(
      `^${left}${regExpEmojiOne0}${regExpEmojiOne1}${key2}${key3}${regExpCustom4}${regExpCustom5}${
        keys[6]
      }${keys[7]}${regExpUnicode8}${regExpUnicode9}${right}$`,
    );
    expect(result).toMatch(regExp);
  });
  // 'abc:smile::cry:<3:D:rc::att::xxx::yyy123:'.match()
});

describe('Duplicate mapping key, because glip has old data problems', () => {
  it('should be a img tag when duplicate key both in custom and emojione', async () => {
    const result = format(':horse:');
    // custom emoji first
    const regExp = new RegExp(
      `^<img[^>]+?${customEmojiMap.horse.data}[^>]+?>$`,
    );
    expect(result).toMatch(regExp);
  });
});

describe('Emoji key colon regexp expression', () => {
  it('should be a img tag when there are a colon before and after it', async () => {
    const result = format('::smile::');
    const unicode = mapEmojiOne[':smile:'].fname;
    const regExp = new RegExp(`^:<img[^>]+?${unicode}[^>]+?>:$`);
    expect(result).toMatch(regExp);
  });

  it('should be a img tag when there are emoji keys in the back', async () => {
    const result = format(':cry:smile');
    const unicode = mapEmojiOne[':cry:'].fname;
    const regExp = new RegExp(`^<img[^>]+?${unicode}[^>]+?>smile$`);
    expect(result).toMatch(regExp);
  });

  it('should be a img tag when there are emoji keys in the front', async () => {
    const result = format('cry:smile:');
    const unicode = mapEmojiOne[':smile:'].fname;
    const regExp = new RegExp(`^cry<img[^>]+?${unicode}[^>]+?>$`);
    expect(result).toMatch(regExp);
  });

  it('should be a img tag when there are one emoji keys effective', async () => {
    const result = format(':cry:smile:');
    const unicode = mapEmojiOne[':cry:'].fname;
    const regExp = new RegExp(`^<img[^>]+?${unicode}[^>]+?>smile:$`);
    expect(result).toMatch(regExp);
  });

  it('should be two img tag when there are two emoji keys effective', async () => {
    const result = format(':cry::smile:');
    const unicode1 = mapEmojiOne[':cry:'].fname;
    const unicode2 = mapEmojiOne[':smile:'].fname;
    const regExp1 = `^<img[^>]+?${unicode1}[^>]+?>`;
    const regExp2 = `<img[^>]+?${unicode2}[^>]+?>$`;
    const regExp = new RegExp(regExp1 + regExp2);
    expect(result).toMatch(regExp);
  });
});
