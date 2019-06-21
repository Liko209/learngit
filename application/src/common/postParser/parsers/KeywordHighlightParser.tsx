/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:34:56
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  IPostParser,
  ParserType,
  KeywordHighlightParserOption,
} from '../types';
import { ParseContent } from '../ParseContent';
import { JuiTextWithHighlight } from 'jui/components/TextWithHighlight';
import { PostParser } from './PostParser';

class KeywordHighlightParser extends PostParser implements IPostParser {
  type = ParserType.KEYWORD_HIGHLIGHT;
  ignoredRangeTypes = [
    ParserType.AT_MENTION,
    ParserType.EMOJI,
    ParserType.PHONE_NUMBER,
    ParserType.FILE_NAME,
    ParserType.URL,
  ];
  content: ParseContent;
  constructor(public options: KeywordHighlightParserOption) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    return (
      <JuiTextWithHighlight>
        {this.options.innerContentParser
          ? this.options.innerContentParser(strValue)
          : strValue}
      </JuiTextWithHighlight>
    );
  }

  getRegexp() {
    if (!this.options.keyword) {
      throw Error('No keyword specified');
    }
    const terms = this.options.keyword
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(/\s/)
      .filter(str => str.trim());
    return new RegExp(
      terms.join('|').replace(/([.?*+^$[\]\\(){}-])/g, '\\$1'),
      'gi',
    );
  }
}

export { KeywordHighlightParser };
