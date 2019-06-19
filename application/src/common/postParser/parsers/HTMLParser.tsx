/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 16:29:36
 * Copyright © RingCentral. All rights reserved.
 */
import { IPostParser, ParserType, Replacer, HTMLParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { HTMLUnescape, getTopLevelChildNodesFromHTML } from '../utils';
import React from 'react';
import { Markdown } from 'glipdown';
import _ from 'lodash';

class HTMLParser extends PostParser implements IPostParser {
  type = ParserType.HTML;
  content: ParseContent;
  constructor(public options: HTMLParserOption) {
    super(options);
  }

  parseToReplacers() {
    const { withGlipdown } = this.options;
    const originalStr = this.content.getOriginalStr();
    const htmlText = withGlipdown ? Markdown(originalStr) : originalStr;
    const range = {
      startIndex: 0,
      length: originalStr.length,
      parserType: this.type,
    };
    const replacers: Replacer[] = [];
    replacers.push({
      ...range,
      element: this.getReplaceElement(htmlText),
    });
    this.removeReplacersInsideRange(range);
    return replacers;
  }

  getReplaceElement(strValue: string) {
    return strValue.includes('<') && strValue.includes('>')
      ? this._parseHTML(strValue)
      : this._parsePlainText(HTMLUnescape(strValue || '') || '');
  }

  private _parseHTML(value: string) {
    const childNodes = getTopLevelChildNodesFromHTML(value);
    return _.flatten(
      childNodes.map((child, index) => {
        if (child.isTag) {
          const tagName = child.tag as string;
          const children = this._parseElementNodeInnerHTML(
            child.inner || '',
            tagName,
          );
          return React.createElement(
            tagName,
            { ...child.attrs, key: index },
            children,
          ) as React.ReactChild;
        }
        return this._parsePlainText(HTMLUnescape(child.substring || '') || '');
      }),
    );
  }

  private _parseElementNodeInnerHTML(html: string, containerTag: string) {
    return new HTMLParser({
      ...this.options,
      containerTag,
      withGlipdown: false, // glipdown is already parsed at this stage
    })
      .setContent(new ParseContent(html))
      .parse();
  }

  private _parsePlainText(text: string) {
    return this.options.innerContentParser
      ? this.options.innerContentParser(text, this.options.containerTag)
      : text;
  }
}

export { HTMLParser };
