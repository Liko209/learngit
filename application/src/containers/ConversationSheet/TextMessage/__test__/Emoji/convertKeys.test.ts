/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-07 13:57:36
 * Copyright © RingCentral. All rights reserved.
 */

import { Markdown } from 'glipdown';
import { mapAscii, mapUnicode, mapSpecial } from '../../Emoji/map';
import { convertMapAscii, convertMapUnicode, regExpSpecial, regExpAscii, regExpUnicode } from '../../Emoji/convertKeys';

function getUnicode(originKey: string, regExp: RegExp, convertMapData: { [index: string]: string }) {
  const markdownKey = Markdown(originKey);
  const unicode = markdownKey.replace(regExp, (match: string) => {
    // Note: Glipdown does not convert regular expression special characters
    const key = match.replace(regExpSpecial, (match: string) => mapSpecial[match]);
    return convertMapData[key];
  });
  // console.log(`originKey: ${originKey}, markdownKey: ${markdownKey}, unicode: ${unicode}`);
  return unicode;
}

describe('convertKeys', () => {
  it('Ascii key find value', async () => {
    Object.keys(mapAscii).forEach((originKey: string) => {
      const unicode = getUnicode(originKey, regExpAscii, convertMapAscii);
      expect(unicode).toBe(mapAscii[originKey]);
    });
  });

  it('Unicode key find value', () => {
    Object.keys(mapUnicode).forEach((originKey: string) => {
      const unicode = getUnicode(originKey, regExpUnicode, convertMapUnicode);
      expect(unicode).toBe(mapUnicode[originKey]);
    });
  });
});
