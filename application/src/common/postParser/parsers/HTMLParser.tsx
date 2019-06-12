/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 16:29:36
 * Copyright © RingCentral. All rights reserved.
 */
import { IPostParser, ParserType, Replacer, HTMLParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import {
  getComplementRanges,
  MATCH_ALL_REGEX,
  AT_MENTION_GROUPED_REGEXP,
} from '../utils';
import React from 'react';
import { Markdown, Remove_Markdown } from 'glipdown';
import _ from 'lodash';

class HTMLParser extends PostParser implements IPostParser {
  type = ParserType.HTML;
  ignoredRangeTypes = [ParserType.AT_MENTION, ParserType.EMOJI];
  content: ParseContent;
  constructor(public options: HTMLParserOption) {
    super(options);
  }

  parseToReplacers() {
    const { withGlipdown, exclude } = this.options;
    const str = this.content.getOriginalStr();
    // only need to deal with unhandled sections (ignore atmentions and emojis if they are handled before)
    const targetRanges = getComplementRanges(
      this.getIgnoredRanges(),
      str.length,
    );
    const replacers: Replacer[] = [];
    targetRanges.forEach(range => {
      const { startIndex, length } = range;
      let match = str.substr(startIndex, length);
      if (withGlipdown && exclude) {
        // remove markdown inside atmention, emoji etc if they are handle after markdown
        match = match
          .replace(exclude, atMention => {
            return Remove_Markdown(atMention, { dont_escape: true });
          })
          .replace(
            AT_MENTION_GROUPED_REGEXP, // we need to encode the text inside atmention so it won't get parsed first, for example when some crazy user name is a url
            (full, g1, g2, g3) => `${g1}${btoa(g2)}${g3}`,
          );
      }
      const htmlText = withGlipdown ? Markdown(match) : match;
      replacers.push({
        ...range,
        element: this.isValidMatch(htmlText)
          ? this.getReplaceElement(htmlText)
          : htmlText,
      });
      this.removeReplacersInsideRange(range);
    });
    return replacers;
  }

  isValidMatch(match: string) {
    return !!(match && match.trim().length);
  }

  getReplaceElement(strValue: string) {
    return this._parseHTML(strValue);
  }

  getRegexp() {
    return new RegExp(MATCH_ALL_REGEX);
  }

  private _parseHTML(value: string) {
    const { containerTag } = this.options;
    const container = document.createElement(containerTag || 'div');
    container.innerHTML = value;
    const childNodes = Array.from(container.childNodes);
    return _.flatten(
      childNodes.map((child, index) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const elem = child as Element;
          const tagName = elem.tagName.toLowerCase();
          const attrs = {};
          Array.from(elem.attributes).forEach(attr => {
            attrs[attr.name === 'class' ? 'className' : attr.name] = attr.value;
          });
          const children = this._parseElementNodeInnerHTML(
            (child as Element).innerHTML,
            tagName,
          );
          return React.createElement(
            tagName,
            { ...attrs, key: index },
            children,
          ) as React.ReactChild;
        }
        if (child.nodeType === Node.TEXT_NODE) {
          return this._parseTextNodeInnerText(child.textContent || ''); // textContent is unescaped automatically
        }
        return null;
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

  private _parseTextNodeInnerText(text: string) {
    return this.options.innerContentParser
      ? this.options.innerContentParser(text)
      : text;
  }
}

export { HTMLParser };
