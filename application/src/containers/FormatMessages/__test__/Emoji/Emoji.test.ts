/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:07:25
 * Copyright © RingCentral. All rights reserved.
 */

import { Emoji } from '../../Emoji';
import mapEmojiOne from '../../Emoji/mapEmojiOne';
import mapAscii from '../../Emoji/mapAscii';

const staticHttpServer = 'https://www.abc.com/a/b';
const customEmojiMap = {
  rc: { data: 'https://www.123.com/a/rc.png' },
  att: { data: 'https://www.123.com/a/att.png' },
};
const CLASS_NAME = 'enlarge-emoji';

function format(text: string) {
  const emoji = new Emoji(text, staticHttpServer, customEmojiMap);
  emoji.formatAscii().formatEmojiOne().formatCustom();
  return emoji.text;
}

describe('format one kind emoji', () => {
  it('only one kind emoji, has specific class name', async () => {
    const keys = [':smile:', '<3', ':rc:', ':xyz:'];
    // EmojiOne
    const result1 = format(keys[0]);
    const unicode1 = mapEmojiOne[keys[0]];
    const regExp1 = new RegExp(`^<img[^>]+?${CLASS_NAME}[^>]+?${unicode1}\.png[^>]+?>$`);
    expect(result1).toMatch(regExp1);
    // Ascii
    const result2 = format(keys[1]);
    const unicode2 = mapAscii[keys[1]];
    const regExp2 = new RegExp(`^<img[^>]+?${CLASS_NAME}[^>]+?${unicode2}\.png[^>]+?>$`);
    expect(result2).toMatch(regExp2);
    // Custom
    const result3 = format(keys[2]);
    const src = customEmojiMap.rc.data;
    const regExp3 = new RegExp(`^<img[^>]+?${CLASS_NAME}[^>]+?${src}[^>]+?>$`);
    expect(result3).toMatch(regExp3);
    // No match
    const result4 = format(keys[3]);
    const regExp4 = new RegExp(`^${keys[3]}$`);
    expect(result4).toMatch(regExp4);
  });

  it('only one kind emoji, some text on emoji left and right', async () => {
    const keys = [':smile:', '<3', ':rc:', ':xyz:'];
    const left = 'abc';
    const right = '123';
    // EmojiOne
    const result1 = format(`${left}${keys[0]}${right}`);
    const unicode1 = mapEmojiOne[keys[0]];
    const regExp1 = new RegExp(`^${left}<img[^>]+?${unicode1}\.png[^>]+?>${right}$`);
    expect(result1).toMatch(regExp1);
    // Ascii
    const result2 = format(`${left}${keys[1]}${right}`);
    const regExp2 = new RegExp(`^${left}${keys[1]}${right}$`);
    expect(result2).toMatch(regExp2);
    // Custom
    const result3 = format(`${left}${keys[2]}${right}`);
    const src = customEmojiMap.rc.data;
    const regExp3 = new RegExp(`^${left}<img[^>]+?${src}[^>]+?>${right}$`);
    expect(result3).toMatch(regExp3);
    // No match
    const result4 = format(`${left}${keys[3]}${right}`);
    const regExp4 = new RegExp(`^${left}${keys[3]}${right}$`);
    expect(result4).toMatch(regExp4);
  });

});

describe('format multiple emoji', () => {
  it('multiple emoji', async () => {
    const keys = [':smile:', ':cry:', '<3', ':D', ':rc:', ':att:', ':xxx:', ':yyy:'];
    const left = 'abc';
    const right = '123';

    const result = format(`${left}${keys.join('')}${right}`);
    const unicode1 = mapEmojiOne[keys[0]].fname;
    const unicode2 = mapEmojiOne[keys[1]].fname;
    const src1 = customEmojiMap.rc.data;
    const src2 = customEmojiMap.att.data;
    const regExpEmojiOne1 = `<img[^>]+?${unicode1}\.png[^>]+?>`;
    const regExpEmojiOne2 = `<img[^>]+?${unicode2}\.png[^>]+?>`;
    const regExpCustom1 = `<img[^>]+?${src1}[^>]+?>`;
    const regExpCustom2 = `<img[^>]+?${src2}[^>]+?>`;
    const regExp = new RegExp(`^${left}${regExpEmojiOne1}${regExpEmojiOne2}${keys[2]}${keys[3]}${regExpCustom1}${regExpCustom2}${keys[6]}${keys[7]}${right}$`);
    expect(result).toMatch(regExp);
  });

  // it('multiple emoji', async () => {
  //   const keys = [':D', ':rc:'];
  //   const result = format(`${keys.join('')}`);
  //   const src = customEmojiMap.rc.data;
  //   const regExp = new RegExp(`^${keys[0]}<img[^>]+?${src}[^>]+?>$`);
  //   expect(result).toMatch(regExp);
  // });
});
