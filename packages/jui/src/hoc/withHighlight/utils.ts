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

const highlightFormatter = (terms: string[], value: string) => {
  const reg = new RegExp(
    terms.join('|').replace(/([.?*+^$[\]\\(){}-])/g, '\\$1'),
    'gi',
  );
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

export { highlightFormatter };
