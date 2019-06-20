/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 10:08:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { EMOJI_REGEX, b64DecodeUnicode } from '../utils';

class EmojiParser extends PostParser implements IPostParser {
  type = ParserType.EMOJI;
  content: ParseContent;
  constructor(public options: {}) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    const result = this.getRegexp().exec(strValue);
    if (!result || !result[0]) {
      return strValue;
    }
    try {
      const data = JSON.parse(b64DecodeUnicode(result[1]));
      return <img {...data} />;
    } catch (err) {
      return strValue;
    }
  }

  getRegexp() {
    return new RegExp(EMOJI_REGEX);
  }
}

export { EmojiParser };
