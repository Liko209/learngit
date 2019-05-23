/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-25 12:06:05
 * Copyright © RingCentral. All rights reserved.
 */
import objectPath from 'object-path';

const _wrapMatchedWord = (fullText: string, reg: RegExp) => {
  if (typeof fullText !== 'string') return fullText;

  const matchedInEntityRegex = new RegExp(
    `(&[^&]*)(${reg.source})(?=\\w*;)`,
    reg.flags,
  );
  const indexesOfMatchedInEntity: number[] = [];
  let result = matchedInEntityRegex.exec(fullText);
  while (result) {
    indexesOfMatchedInEntity.push(result.index + result[1].length);
    result = matchedInEntityRegex.exec(fullText);
  }
  return fullText.replace(reg, (match: string, ...args: any[]) => {
    if (
      typeof args[0] === 'number' &&
      indexesOfMatchedInEntity.includes(args[0])
    ) {
      return match;
    }
    return `<span class="highlight-term">${match}</span>`;
  });
};

const _isHTML = (str: string) => {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
};

const _HTMLescape = (html: string) => {
  if (!html) {
    return html;
  }
  return document
    .createElement('div')
    .appendChild(document.createTextNode(html)).parentElement!.innerHTML;
};

const getRegexpFromKeyword = (keyword: string) => {
  const terms = keyword
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(/\s/)
    .filter(str => str.trim());
  return new RegExp(
    terms.join('|').replace(/([.?*+^$[\]\\(){}-])/g, '\\$1'),
    'gi',
  );
};

const highlightFormatter = (keyword: string, value: string) => {
  const reg = getRegexpFromKeyword(keyword);
  if (_isHTML(value)) {
    const container = document.createElement('div');
    container.innerHTML = value;
    const nodes = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let textNode = nodes.nextNode();
    const originalTextNodes = [];
    while (textNode) {
      const fullTextContent = _HTMLescape(textNode.textContent || '');
      if (fullTextContent.search(reg) >= 0) {
        const html = _wrapMatchedWord(fullTextContent, reg);
        const span = document.createElement('span');
        span.innerHTML = html;
        const parentNode = textNode.parentNode;
        Array.from(span.childNodes).forEach(node => {
          if (parentNode) {
            parentNode.insertBefore(node, textNode);
          }
        });
        originalTextNodes.push(textNode);
      }
      textNode = nodes.nextNode();
    }
    originalTextNodes.length &&
      originalTextNodes.forEach(node => {
        node.parentNode && node.parentNode.removeChild(node);
      });
    return container.innerHTML;
  }
  return _wrapMatchedWord(value, reg);
};

const cascadingGet = (obj: Object, path: string) => {
  return objectPath.get(obj, path);
};

const cascadingCreate = (path: string, value: any) => {
  const newObj = {};
  objectPath.set(newObj, path, value);
  return newObj;
};

export {
  getRegexpFromKeyword,
  highlightFormatter,
  cascadingGet,
  cascadingCreate,
};
