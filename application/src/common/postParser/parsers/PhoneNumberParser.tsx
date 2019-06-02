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

class PhoneNumberParser extends PostParser implements IPostParser {
  type = ParserType.PHONE_NUMBER;
  ignoredRangeTypes = [
    ParserType.AT_MENTION,
    ParserType.KEYWORD_HIGHLIGHT,
    ParserType.HTML,
    ParserType.EMOJI,
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

  isValidMatch(value: string) {
    const IS_PHONE_NUMBER = /\+?(\d{1,4} ?)?((\(\d{1,4}\)|\d(( |\-)?\d){0,3})(( |\-)?\d){2,}|(\(\d{2,4}\)|\d(( |\-)?\d){1,3})(( |\-)?\d){1,})(( x| ext.?)\d{1,5}){0,1}/g.test(
      value,
    );
    const NUMBER_WITH_PLUS = 10;
    const MIN_PHONE_NUMBER_LENGTH = 7;
    const MAX_PHONE_NUMBER_LENGTH = 15;
    if (!value) return false;
    const noneSpecialChar = value.replace(/\+|\-|\(|\)|\s+/g, '');
    const phoneNumberLength = noneSpecialChar.length;
    if (value.indexOf('+') === 0 && IS_PHONE_NUMBER) {
      return (
        phoneNumberLength >= NUMBER_WITH_PLUS &&
        phoneNumberLength <= MAX_PHONE_NUMBER_LENGTH
      );
    }
    if (
      phoneNumberLength < MIN_PHONE_NUMBER_LENGTH ||
      phoneNumberLength > MAX_PHONE_NUMBER_LENGTH
    ) {
      return false;
    }
    return IS_PHONE_NUMBER;
  }
}

export { PhoneNumberParser };
