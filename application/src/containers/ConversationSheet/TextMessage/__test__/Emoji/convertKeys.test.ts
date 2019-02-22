/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-07 13:57:36
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { mapAscii, mapUnicode, mapSpecial, mapEmojiOne } from '../../Emoji/map';
import {
  convertMapAscii,
  convertMapUnicode,
  regExpSpecial,
  regExpAscii,
  regExpUnicode,
  convertMapEmojiOne,
  regExpEmojiOne,
  MapData,
  EmojiOne,
} from '../../Emoji/convertKeys';

function getUnicode(
  originKey: string,
  regExp: RegExp,
  convertMapData: MapData,
) {
  const markdownKey = Markdown(originKey);
  const unicode = markdownKey.replace(regExp, (match: string) => {
    // Note: Glipdown does not convert regular expression special characters
    const key = match.replace(
      regExpSpecial,
      (match: string) => mapSpecial[match],
    );
    if (convertMapData[key] instanceof Object) {
      return (convertMapData[key] as EmojiOne).fname;
    }
    return convertMapData[key].toString();
  });
  return unicode;
}

describe('convertKeys', () => {
  it('should be equal when use regexp expression ascii key find value', async () => {
    Object.keys(mapAscii).forEach((originKey: string) => {
      const unicode = getUnicode(originKey, regExpAscii, convertMapAscii);
      expect(unicode).toBe(mapAscii[originKey]);
    });
  });

  it('should be equal when use regexp expression unicode key find value', () => {
    Object.keys(mapUnicode).forEach((originKey: string) => {
      const unicode = getUnicode(originKey, regExpUnicode, convertMapUnicode);
      expect(unicode).toBe(mapUnicode[originKey]);
    });
  });

  it('should be equal when use regexp expression emojiOne key find value', () => {
    Object.keys(mapEmojiOne).forEach((originKey: string) => {
      const unicode = getUnicode(originKey, regExpEmojiOne, convertMapEmojiOne);
      expect(unicode).toBe(mapEmojiOne[originKey].fname);
    });
  });
});
