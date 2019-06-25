/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 19:18:31
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IPostParser,
  TextRange,
  FullParser,
  ParserType,
  Replacer,
  ChildrenType,
  ParserOption,
} from '../types';
import { ParseContent } from '../ParseContent';
import { containsRange, hasIntersection } from '../utils';

abstract class PostParser implements IPostParser {
  type: ParserType;
  content: ParseContent;
  protected innerContentParser: FullParser | null;

  constructor(options: ParserOption = {}) {
    if (options.innerContentParser) {
      this.innerContentParser = options.innerContentParser;
    }
  }

  setContent(content: ParseContent | string) {
    if (typeof content === 'string') {
      this.content = new ParseContent(content);
    } else {
      this.content = content;
    }
    return this;
  }

  // for standalone use
  parse() {
    if (!this.content) {
      throw Error('Please set content to parse first. Call parser.setContent.');
    }
    this.content.addReplacers(this.parseToReplacers());
    return this.content.getParsedResult();
  }

  parseToReplacers() {
    const str = this.content.getOriginalStr();
    if (
      this.content
        .getReplacers()
        .some(
          ({ startIndex, length }) => startIndex === 0 && length === str.length,
        )
    ) {
      return [];
    }
    const regexp = this.getRegexp();
    if (!regexp) {
      return [
        {
          startIndex: 0,
          length: str.length,
          parserType: this.type,
          element: this.getReplaceElement(str),
        },
      ];
    }
    const replacers: Replacer[] = [];
    let result = regexp.exec(str);
    while (result && result[0]) {
      const matchedStr = result[0];
      const range = {
        startIndex: result.index,
        length: matchedStr.length,
        parserType: this.type,
      };
      if (this.isValidMatch(matchedStr, result) && this.isValidRange(range)) {
        replacers.push({
          ...range,
          element: this.getReplaceElement(matchedStr, result),
        });
        this.removeReplacersInsideRange(range);
      }
      result = regexp.exec(str);
    }

    return replacers;
  }

  removeReplacersInsideRange(range: TextRange) {
    // remove existing replacers that are inside the range.
    this.content.removeReplacersBy(({ element, ...rg }) =>
      containsRange(range, rg),
    );
  }

  checkPreCondition(str: string) {
    return true;
  }

  isValidMatch(value: string, execResult?: RegExpExecArray) {
    return true;
  }

  // false if the range has intersection with one of the already-processed-ranges, except when it is containing
  isValidRange(range: TextRange) {
    return !this.content
      .getReplacers()
      .some(
        ignoredRange =>
          hasIntersection(ignoredRange, range) &&
          !containsRange(range, ignoredRange),
      );
  }

  getRegexp(): RegExp | null {
    return null;
  }

  abstract getReplaceElement(
    value: string,
    execResult?: RegExpExecArray,
  ): ChildrenType;
}

export { PostParser };
