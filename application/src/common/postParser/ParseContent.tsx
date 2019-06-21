/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 14:56:14
 * Copyright © RingCentral. All rights reserved.
 */
import { Replacer, ChildrenType } from './types';
import React from 'react';
import _ from 'lodash';
import { getComplementRanges } from './utils';

class ParseContent {
  private _originalStr: string;
  private _replacers: Replacer[] = [];

  constructor(originalStr: string) {
    this._originalStr = originalStr;
  }

  getOriginalStr() {
    return this._originalStr;
  }

  getParsedResult() {
    const str = this.getOriginalStr();
    if (!this._replacers.length) {
      return str;
    }
    const children: ChildrenType = [];
    const plainStringReplacers: Replacer[] = [];
    getComplementRanges(this._replacers, str.length).forEach(range => {
      (range as Replacer).element = str.substr(range.startIndex, range.length);
      plainStringReplacers.push(range);
    });
    this.addReplacers(plainStringReplacers);

    let elementCount = 0;
    const pushChild = (element: React.ReactChild | null | undefined) => {
      if (element) {
        children.push(
          React.isValidElement(element)
            ? React.cloneElement(element, { key: elementCount++ })
            : element,
        );
      }
    };

    this._replacers.forEach(({ element }) =>
      Array.isArray(element) ? element.forEach(pushChild) : pushChild(element),
    );

    if (children.length === 1 && typeof children[0] === 'string') {
      return children[0];
    }
    return children;
  }

  getReplacers() {
    return this._replacers;
  }

  addReplacers(replacers: Replacer[]) {
    this._replacers = this._replacers
      .concat(replacers)
      .sort((a, b) => a.startIndex - b.startIndex);
  }

  removeReplacersBy(identifier: (replacer: Replacer) => boolean) {
    _.remove(this._replacers, identifier);
  }
}

export { ParseContent };
