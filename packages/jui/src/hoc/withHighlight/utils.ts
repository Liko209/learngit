/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-25 12:06:05
 * Copyright © RingCentral. All rights reserved.
 */

const _wrapMatchedWord = (fullText: string, reg: RegExp) =>
  fullText.replace(reg, (match: string) => {
    return `<span class="highlight-term">${match}</span>`;
  });

const _isHTML = (str: string) => {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
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
      const fullTextContent = textNode.textContent || '';
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

const cascadingGet = (obj: Object, key: string) => {
  const hierarchyKeys = key.split('.').filter(k => !!k);
  let currentRef = obj;
  while (hierarchyKeys.length > 1) {
    const currentLevel = hierarchyKeys.shift();
    if (currentLevel) {
      currentRef = { ...currentRef[currentLevel] };
    }
  }
  const lastLevel = hierarchyKeys.shift();
  if (lastLevel) {
    return currentRef[lastLevel];
  }
  return null;
};

const cascadingCreate = (key: string, value: any) => {
  const hierarchyKeys = key.split('.').filter(k => !!k);
  const newObj = {};
  let currentRef = newObj;
  while (hierarchyKeys.length > 1) {
    const currentLevel = hierarchyKeys.shift();
    if (currentLevel) {
      currentRef[currentLevel] =
        typeof currentRef[currentLevel] === 'object'
          ? currentRef[currentLevel]
          : {};
      currentRef = currentRef[currentLevel];
    }
  }
  const lastLevel = hierarchyKeys.shift();
  if (lastLevel) {
    currentRef[lastLevel] = value;
  }
  return { ...newObj };
};

export {
  getRegexpFromKeyword,
  highlightFormatter,
  cascadingGet,
  cascadingCreate,
};
