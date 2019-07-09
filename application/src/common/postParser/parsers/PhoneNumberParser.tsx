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
import { isValidPhoneNumber, VALID_PHONE_REG } from '../utils';

class PhoneNumberParser extends PostParser implements IPostParser {
  type = ParserType.PHONE_NUMBER;
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
    return new RegExp(VALID_PHONE_REG);
  }

  isValidMatch(match: string) {
    return isValidPhoneNumber(match);
  }
}

export { PhoneNumberParser };
