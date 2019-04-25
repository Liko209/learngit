/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-20 14:51:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mapEmojiOne } from './map';

// {
//   "2694-fe0f": ":crossed_swords:",
//   "2694":":crossed_swords:"
// }
const mapUnicodeToShort = {};

for (const key in mapEmojiOne) {
  const arr = mapEmojiOne[key].unicode;
  for (let i = 0, len = arr.length; i < len; i++) {
    const unicode = arr[i];
    mapUnicodeToShort[unicode] = key;
  }
}

export { mapUnicodeToShort };
