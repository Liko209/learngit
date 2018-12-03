/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-05 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */
import { debounce } from 'lodash';
import ReactDOM from 'react-dom';

function getScrollParent(element: HTMLElement, includeHidden: boolean = false) {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden
    ? /(auto|scroll|hidden)/
    : /(auto|scroll)/;

  if (style.position === 'fixed') return document.body;
  let parent: HTMLElement | null = element;
  do {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }

    const overflow = style.overflow || '';
    const overflowX = style.overflowX || '';
    const overflowY = style.overflowY || '';

    if (overflowRegex.test(overflow + overflowX + overflowY)) {
      return parent;
    }
  } while ((parent = parent.parentElement));

  return document.body;
}

async function scrollToComponent(
  component?: React.ReactInstance | null,
  options?: boolean | ScrollIntoViewOptions,
) {
  return new Promise((resolve, reject) => {
    if (!component) return;
    try {
      const el = ReactDOM.findDOMNode(component);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView(options);
        getScrollParent(el).addEventListener('scroll', debounce(resolve, 100));
      }
    } catch (err) {
      resolve();
      console.warn(err);
    }
  });
}

async function nextTick() {
  return new Promise((resolve: Function) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export { scrollToComponent, nextTick };
