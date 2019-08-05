/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 10:08:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType, AtMentionParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { JuiAtMention } from 'jui/components/AtMention';
import { PostParser } from './PostParser';
import { AT_MENTION_REGEX } from '../utils';
import { AtMentionTransformer } from './AtMentionTransformer';
import { HTMLUnescape } from '@/common/postParser/utils';

class AtMentionParser extends PostParser implements IPostParser {
  type = ParserType.AT_MENTION;
  content: ParseContent;
  constructor(public options: AtMentionParserOption) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    const { map = {}, customReplaceFunc, innerContentParser } = this.options;
    const result = this.getRegexp().exec(strValue);
    if (!result || !result[0]) {
      return strValue;
    }
    const id = result[1];
    const user = map[id] || {};
    const { name, isCurrent } = user;
    const text =
      name ||
      HTMLUnescape(AtMentionTransformer.atMentionDataMap[id].replace(/^@/, ''));
    if (customReplaceFunc) {
      return customReplaceFunc(strValue, id, text, !!isCurrent);
    }
    return (
      <JuiAtMention
        id={id}
        name={innerContentParser ? innerContentParser(text) : text}
        isCurrent={!!isCurrent}
      />
    );
  }

  getRegexp() {
    return new RegExp(AT_MENTION_REGEX);
  }
}

export { AtMentionParser };
