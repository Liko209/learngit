/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-31 15:40:49
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IPostParser, ParserType, URLParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { Markdown } from 'glipdown';

class URLParser extends PostParser implements IPostParser {
  type = ParserType.URL;
  ignoredRangeTypes = [
    ParserType.AT_MENTION,
    ParserType.EMOJI,
    ParserType.FILE_NAME,
  ];
  content: ParseContent;

  constructor(public options: URLParserOption) {
    super(options);
  }

  getReplaceElement(strValue: string) {
    const execResult = this.getRegexp().exec(strValue);
    if (!execResult) {
      return strValue;
    }
    const maybeEmail = execResult[2];
    const link = execResult[3];
    const protocol = execResult[5];
    const fullLink =
      maybeEmail && !protocol
        ? `mailto:${maybeEmail}${link}`
        : (protocol ? '' : 'http://') + link;
    const text = (maybeEmail ? maybeEmail : '') + link;
    return (
      <a href={fullLink} target="_blank" rel="noreferrer">
        {this.options.innerContentParser
          ? this.options.innerContentParser(text)
          : text}
      </a>
    );
  }

  getRegexp() {
    return new RegExp(Markdown.global_url_regex);
  }
}

export { URLParser };
