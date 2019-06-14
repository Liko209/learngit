/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 14:56:14
 * Copyright © RingCentral. All rights reserved.
 */
import { Replacer, ChildrenType } from './types';
import React from 'react';
import _ from 'lodash';

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
    let elementCount = 0;
    const addElement = (element: React.ReactChild | null) => {
      if (React.isValidElement(element)) {
        children.push(React.cloneElement(element, { key: elementCount }));
        elementCount += 1;
      } else {
        children.push(element);
      }
    };
    let cursor = 0; // position of current character in the original string
    let currentIndex = 0; // position of current replacer in the array
    let currentReplacer = this._replacers[currentIndex];
    while (cursor < str.length) {
      if (currentReplacer && cursor === currentReplacer.startIndex) {
        // need to be replaced, add the elements to the children[] array
        const { element, length } = currentReplacer;
        if (Array.isArray(element)) {
          element.forEach(elem => addElement(elem));
        } else {
          addElement(element);
        }
        cursor += length;
        currentIndex += 1;
        currentReplacer = this._replacers[currentIndex];
      } else {
        // no need to be replaced, add the sub-string to the children[] array
        const subEnd = currentReplacer
          ? currentReplacer.startIndex
          : str.length;
        children.push(str.substring(cursor, subEnd));
        cursor = subEnd;
      }
    }
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
