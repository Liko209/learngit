/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 10:08:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { EMOJI_REGEX, EMOJI_SIZE_MAP } from '../utils';
import { EmojiTransformer } from './EmojiTransformer';
import { Emoji } from 'emoji-mart';

class EmojiParser extends PostParser implements IPostParser {
  type = ParserType.EMOJI;
  content: ParseContent;
  constructor(public options: {}) {
    super(options);
  }

  getReplaceElement(strValue: string, result: RegExpExecArray | void) {
    let elem: any;
    if (!result || !result[0] || !result[1]) {
      return strValue;
    }
    const id = result[1];
    const emojiData = EmojiTransformer.emojiDataMap[id];
    if (!emojiData.isCustomEmoji && emojiData.name) {
      elem = (
        <Emoji
          emoji={emojiData.name}
          skin={emojiData.tone + 1 || 1}
          set={'emojione'}
          size={
            emojiData.isEnlarged ? EMOJI_SIZE_MAP.large : EMOJI_SIZE_MAP.small
          }
        >
          {emojiData.alt ? emojiData.alt : `:${emojiData.name}:`}
        </Emoji>
      );
    } else {
      elem = <img {...emojiData} />;
    }

    return elem;
  }

  getRegexp() {
    return new RegExp(EMOJI_REGEX);
  }
}

export { EmojiParser };
