/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 10:08:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { EMOJI_REGEX } from '../utils';
import { EmojiTransformer } from './EmojiTransformer';

class EmojiParser extends PostParser implements IPostParser {
  type = ParserType.EMOJI;
  content: ParseContent;
  constructor(public options: {}) {
    super(options);
  }

  getReplaceElement(strValue: string, result: RegExpExecArray | void) {
    if (!result || !result[0] || !result[1]) {
      return strValue;
    }
    const id = result[1];
    const data = EmojiTransformer.emojiDataMap[id];
    const elem = <img {...data} />;
    return elem;
  }

  getRegexp() {
    return new RegExp(EMOJI_REGEX);
  }
}

export { EmojiParser };
