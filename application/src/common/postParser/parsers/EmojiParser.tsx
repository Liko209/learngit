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
    const EMOJI_SET = 'emojione';
    const DEFAULT_TONE_INDEX = 1;
    const id = result[1];
    const emojiData = EmojiTransformer.emojiDataMap[id];
    const { isCustomEmoji, name, tone, isEnlarged, ...others } = emojiData;
    if (!isCustomEmoji && name) {
      elem = (
        <Emoji
          emoji={name}
          skin={tone + DEFAULT_TONE_INDEX || DEFAULT_TONE_INDEX}
          set={EMOJI_SET}
          size={isEnlarged ? EMOJI_SIZE_MAP.large : EMOJI_SIZE_MAP.small}
        >
          {emojiData.alt ? emojiData.alt : `:${name}:`}
        </Emoji>
      );
    } else {
      elem = <img {...others} />;
    }

    return elem;
  }

  getRegexp() {
    return new RegExp(EMOJI_REGEX);
  }
}

export { EmojiParser };
