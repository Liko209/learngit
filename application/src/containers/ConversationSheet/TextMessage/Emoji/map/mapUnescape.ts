/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-06 17:48:38
 * Copyright © RingCentral. All rights reserved.
 */

const mapUnescape = {
  '&amp;': '&',
  '&#38;': '&',
  '&#x26;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&#x3C;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&#x3E;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&#x22;': '"',
  '&apos;': '\'',
  '&#39;': '\'',
  '&#x27;': '\'',
};

export { mapUnescape };
