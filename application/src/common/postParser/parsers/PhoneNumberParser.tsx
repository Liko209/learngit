/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 10:07:49
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType, PhoneNumberParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { PhoneLink } from '@/modules/message/container/ConversationSheet/PhoneLink';
import { isValidPhoneNumber } from '../utils';

class PhoneNumberParser extends PostParser implements IPostParser {
  type = ParserType.PHONE_NUMBER;
  ignoredRangeTypes = [
    ParserType.AT_MENTION,
    ParserType.KEYWORD_HIGHLIGHT,
    ParserType.HTML,
    ParserType.EMOJI,
    ParserType.URL,
  ];
  content: ParseContent;
  constructor(public options: PhoneNumberParserOption) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    return (
      <PhoneLink text={strValue}>
        {this.options.innerContentParser
          ? this.options.innerContentParser(strValue)
          : strValue}
      </PhoneLink>
    );
  }

  getRegexp() {
    const FILTER_NUMBER_STRING_REGEX = /\+?(\d{1,4} ?)?((\(\d{1,4}\)|\d(( |\-)?\d){0,3})(( |\-)?\d){2,}|(\(\d{2,4}\)|\d(( |\-)?\d){1,3})(( |\-)?\d){1,})(( x| ext.?)\d{1,5}){0,1}|[\D]/g;
    return FILTER_NUMBER_STRING_REGEX;
  }

  isValidMatch(match: string) {
    return isValidPhoneNumber(match);
  }
}

export { PhoneNumberParser };
